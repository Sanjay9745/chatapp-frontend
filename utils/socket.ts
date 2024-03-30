// pages/index.js (or any other component)
import SERVER_URL from "@/config/SERVER_URL";
import { io } from "socket.io-client";

const socket = io(`${SERVER_URL}/chat`);

export default socket;