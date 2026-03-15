import { useRef, useCallback, useEffect, useState } from 'react';
import { socket } from '../services/socket.js';

/*
ICE SERVERS CONFIGURATION
STUN → helps find public IP
TURN → relays media when direct connection fails (important for mobile networks)
*/
const ICE_SERVERS = {
    iceServers: [
        // Google STUN servers
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },

        // Free public TURN server (important for mobile networks)
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject',
        },
        {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject',
        }
    ],
};

export default function useWebRTC(localStream, slug, userName) {

    // Store all peer connections
    const peersRef = useRef({});

    // Queue ICE candidates if remote description not ready
    const iceCandidateQueue = useRef({});

    // Store remote streams
    const [remoteStreams, setRemoteStreams] = useState({});

    // Store participant names
    const [peerNames, setPeerNames] = useState({});

    // Track who is screen sharing
    const [screenSharer, setScreenSharer] = useState(null);


    /*
    CREATE PEER CONNECTION
    This creates WebRTC connection with another user
    */
    const createPeerConnection = useCallback((remoteSocketId) => {

        if (peersRef.current[remoteSocketId]) {
            return peersRef.current[remoteSocketId];
        }

        const pc = new RTCPeerConnection({
            ...ICE_SERVERS,
            iceCandidatePoolSize: 10
        });

        // Add local tracks (camera + microphone)
        if (localStream) {
            localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream);
            });
        }

        // Send ICE candidates to remote peer
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', {
                    target: remoteSocketId,
                    candidate: event.candidate.toJSON(),
                });
            }
        };

        // When remote stream received
        pc.ontrack = (event) => {
            const [remoteStream] = event.streams;

            setRemoteStreams(prev => ({
                ...prev,
                [remoteSocketId]: remoteStream
            }));
        };

        // If connection fails remove peer
        pc.oniceconnectionstatechange = () => {
            if (
                pc.iceConnectionState === 'disconnected' ||
                pc.iceConnectionState === 'failed'
            ) {
                removePeer(remoteSocketId);
            }
        };

        peersRef.current[remoteSocketId] = pc;
        iceCandidateQueue.current[remoteSocketId] = [];

        return pc;

    }, [localStream]);


    /*
    REMOVE PEER CONNECTION
    */
    const removePeer = useCallback((socketId) => {

        if (peersRef.current[socketId]) {
            peersRef.current[socketId].close();
            delete peersRef.current[socketId];
        }

        delete iceCandidateQueue.current[socketId];

        setRemoteStreams(prev => {
            const next = { ...prev };
            delete next[socketId];
            return next;
        });

        setPeerNames(prev => {
            const next = { ...prev };
            delete next[socketId];
            return next;
        });

        setScreenSharer(prev => prev === socketId ? null : prev);

    }, []);


    /*
    ADD QUEUED ICE CANDIDATES
    */
    const flushIceCandidates = useCallback(async (socketId) => {

        const pc = peersRef.current[socketId];
        const queue = iceCandidateQueue.current[socketId] || [];

        for (const candidate of queue) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error('Error adding ICE candidate:', err);
            }
        }

        iceCandidateQueue.current[socketId] = [];

    }, []);


    /*
    REPLACE VIDEO TRACK
    Used during screen sharing
    */
    const replaceVideoTrack = useCallback((newTrack) => {

        Object.values(peersRef.current).forEach(pc => {

            const sender = pc.getSenders().find(
                s => s.track?.kind === 'video'
            );

            if (sender) {
                sender.replaceTrack(newTrack);
            }

        });

    }, []);


    useEffect(() => {

        if (!localStream || !slug) return;

        // Connect socket if not already connected
        if (!socket.connected) {
            socket.connect();
        }


        /*
        WHEN USER JOINS ROOM
        */
        const handleAllUsers = async (users) => {

            for (const user of users) {

                const remoteId = user.socketId;
                const remoteName = user.userName;

                setPeerNames(prev => ({
                    ...prev,
                    [remoteId]: remoteName
                }));

                const pc = createPeerConnection(remoteId);

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                socket.emit('offer', {
                    target: remoteId,
                    sdp: pc.localDescription
                });

            }

        };


        /*
        HANDLE OFFER
        */
        const handleOffer = async ({ sdp, caller, callerName }) => {

            if (callerName) {
                setPeerNames(prev => ({
                    ...prev,
                    [caller]: callerName
                }));
            }

            const pc = createPeerConnection(caller);

            await pc.setRemoteDescription(
                new RTCSessionDescription(sdp)
            );

            await flushIceCandidates(caller);

            const answer = await pc.createAnswer();

            await pc.setLocalDescription(answer);

            socket.emit('answer', {
                target: caller,
                sdp: pc.localDescription
            });

        };


        /*
        HANDLE ANSWER
        */
        const handleAnswer = async ({ sdp, answerer, answererName }) => {

            if (answererName) {
                setPeerNames(prev => ({
                    ...prev,
                    [answerer]: answererName
                }));
            }

            const pc = peersRef.current[answerer];

            if (pc) {

                await pc.setRemoteDescription(
                    new RTCSessionDescription(sdp)
                );

                await flushIceCandidates(answerer);

            }

        };


        /*
        HANDLE ICE CANDIDATES
        */
        const handleIceCandidate = ({ candidate, from }) => {

            const pc = peersRef.current[from];

            if (pc && pc.remoteDescription) {

                pc.addIceCandidate(
                    new RTCIceCandidate(candidate)
                );

            } else {

                if (!iceCandidateQueue.current[from]) {
                    iceCandidateQueue.current[from] = [];
                }

                iceCandidateQueue.current[from].push(candidate);

            }

        };


        /*
        USER JOINED
        */
        const handleUserJoined = ({ socketId, userName }) => {

            setPeerNames(prev => ({
                ...prev,
                [socketId]: userName
            }));

        };


        /*
        USER LEFT
        */
        const handleUserLeft = ({ socketId }) => {
            removePeer(socketId);
        };


        socket.on('all-users', handleAllUsers);
        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('ice-candidate', handleIceCandidate);
        socket.on('user-joined', handleUserJoined);
        socket.on('user-left', handleUserLeft);

        // Join room
        socket.emit('join-room', { slug, userName });


        return () => {

            socket.off('all-users', handleAllUsers);
            socket.off('offer', handleOffer);
            socket.off('answer', handleAnswer);
            socket.off('ice-candidate', handleIceCandidate);
            socket.off('user-joined', handleUserJoined);
            socket.off('user-left', handleUserLeft);

            Object.keys(peersRef.current).forEach(removePeer);

        };

    }, [
        localStream,
        slug,
        userName,
        createPeerConnection,
        flushIceCandidates,
        removePeer
    ]);


    return {
        remoteStreams,
        peerNames,
        screenSharer,
        replaceVideoTrack
    };
}