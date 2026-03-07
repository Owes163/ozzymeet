import { io } from "socket.io-client";

const BACKEND_URL = "http://localhost:3001";

export const socket = io(BACKEND_URL, {
  transports: ["websocket"],
});

export const API_URL = BACKEND_URL;