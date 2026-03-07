import { io } from "socket.io-client";

const BACKEND_URL = "https://ozzymeet-backend.onrender.com";

export const socket = io(BACKEND_URL, {
  autoConnect: false,
  transports: ["websocket"],
});

export const API_URL = BACKEND_URL;