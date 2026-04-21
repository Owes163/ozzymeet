import { useState } from "react";

export default function InviteMenu() {

  const [open, setOpen] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Meeting link copied!");
    setOpen(false);
  };

  const shareWhatsApp = () => {
    const url = window.location.href;
    const text = `Join my OzzyMeet meeting: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    setOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>

      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
          color: "white"
        }}
      >
        🔗
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "35px",
            background: "#1f2235",
            borderRadius: "8px",
            padding: "8px",
            width: "160px",
            zIndex: 9999
          }}
        >

          <div
            onClick={copyLink}
            style={{
              padding: "8px",
              cursor: "pointer"
            }}
          >
            📋 Link
          </div>

          <div
            onClick={shareWhatsApp}
            style={{
              padding: "8px",
              cursor: "pointer"
            }}
          >
            📲 WhatsApp
          </div>

        </div>
      )}
    </div>
  );
}