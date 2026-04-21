import { useEffect, useRef } from "react";

export default function VideoTile({
  stream,
  name,
  isLocal,
  isMuted,
  isVideoOff,
  isPinned,
  isScreenShare,
  onClick,
}) {
  const videoRef = useRef(null);

  // attach stream to video
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;

      // 🔥 IMPORTANT: sirf local mute
      videoRef.current.muted = isLocal;

      // autoplay fix
      videoRef.current.play().catch(() => {});
    }
  }, [stream, isLocal]);

  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div
      className={`video-tile ${isLocal ? "local" : ""}`}
      onClick={onClick}
    >
      {/* video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // ❗ main fix
      />

      {/* avatar when video off */}
      {isVideoOff && (
        <div className="video-avatar">
          <div className="avatar">{initial}</div>
        </div>
      )}

      {/* name */}
      <div className="video-name">
        {isLocal ? `${name} (You)` : name}
      </div>

      {/* mute icon */}
      {isMuted && <div className="mute-icon">🔇</div>}

      {/* pin */}
      {isPinned && <div className="pin">📌</div>}
    </div>
  );
}