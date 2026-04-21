// src/hooks/useWebRTC.js

import { useRef, useCallback, useEffect, useState } from 'react';
import { socket } from '../services/socket.js';

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject"
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject"
    }
  ],
};

export default function useWebRTC(localStream, slug, userName) {

  const peersRef = useRef({});
  const iceCandidateQueue = useRef({});
  const [remoteStreams, setRemoteStreams] = useState({});
  const [peerNames, setPeerNames] = useState({});
  const [screenSharer, setScreenSharer] = useState(null);

  // 🔥 CREATE PEER
  const createPeerConnection = useCallback((remoteSocketId) => {

    if (peersRef.current[remoteSocketId]) {
      return peersRef.current[remoteSocketId];
    }

    const pc = new RTCPeerConnection({
      ...ICE_SERVERS,
      iceCandidatePoolSize: 10
    });

    // ✅ ADD AUDIO + VIDEO TRACKS
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // ICE send
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          target: remoteSocketId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    // RECEIVE STREAM
    pc.ontrack = (event) => {
      let remoteStream = event.streams?.[0];

      if (!remoteStream) {
        remoteStream = new MediaStream();
        remoteStream.addTrack(event.track);
      }

      setRemoteStreams(prev => ({
        ...prev,
        [remoteSocketId]: remoteStream,
      }));
    };

    // FAIL SAFE
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "failed") {
        removePeer(remoteSocketId);
      }
    };

    peersRef.current[remoteSocketId] = pc;
    iceCandidateQueue.current[remoteSocketId] = [];

    return pc;

  }, [localStream]);

  // 🔥 REMOVE PEER
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

  // 🔥 ICE QUEUE
  const flushIceCandidates = useCallback(async (socketId) => {
    const pc = peersRef.current[socketId];
    const queue = iceCandidateQueue.current[socketId] || [];

    for (const candidate of queue) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error(err);
      }
    }

    iceCandidateQueue.current[socketId] = [];
  }, []);

  // 🔥 ⭐ MAIN FIX (AUDIO SEND FIX)
  const replaceAudioTrack = useCallback((newStream) => {
    Object.values(peersRef.current).forEach(pc => {
      const sender = pc.getSenders().find(
        s => s.track && s.track.kind === "audio"
      );

      const newAudioTrack = newStream.getAudioTracks()[0];

      if (sender && newAudioTrack) {
        sender.replaceTrack(newAudioTrack);
      }
    });
  }, []);

  // 🔥 VIDEO TRACK (screen share)
  const replaceVideoTrack = useCallback((newTrack) => {
    Object.values(peersRef.current).forEach(pc => {
      const sender = pc.getSenders().find(
        s => s.track?.kind === 'video'
      );
      if (sender) sender.replaceTrack(newTrack);
    });
  }, []);

  useEffect(() => {

    if (!localStream || !slug) return;

    if (!socket.connected) socket.connect();

    // USERS LIST
    const handleAllUsers = async (users) => {

      for (const user of users) {
        const remoteId = user.socketId;

        setPeerNames(prev => ({
          ...prev,
          [remoteId]: user.userName
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

    // OFFER
    const handleOffer = async ({ sdp, caller, callerName }) => {

      setPeerNames(prev => ({
        ...prev,
        [caller]: callerName
      }));

      const pc = createPeerConnection(caller);

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      await flushIceCandidates(caller);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('answer', {
        target: caller,
        sdp: pc.localDescription
      });
    };

    // ANSWER
    const handleAnswer = async ({ sdp, answerer, answererName }) => {

      setPeerNames(prev => ({
        ...prev,
        [answerer]: answererName
      }));

      const pc = peersRef.current[answerer];

      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        await flushIceCandidates(answerer);
      }
    };

    // ICE
    const handleIceCandidate = ({ candidate, from }) => {

      const pc = peersRef.current[from];

      if (pc && pc.remoteDescription) {
        pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        if (!iceCandidateQueue.current[from]) {
          iceCandidateQueue.current[from] = [];
        }
        iceCandidateQueue.current[from].push(candidate);
      }
    };

    socket.on('all-users', handleAllUsers);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    socket.emit('join-room', { slug, userName });

    return () => {
      socket.off('all-users', handleAllUsers);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);

      Object.keys(peersRef.current).forEach(removePeer);
    };

  }, [localStream, slug, userName, createPeerConnection, flushIceCandidates, removePeer]);

  return {
    remoteStreams,
    peerNames,
    screenSharer,
    replaceVideoTrack,
    replaceAudioTrack // 🔥 expose
  };
}