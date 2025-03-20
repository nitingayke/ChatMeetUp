import { io } from 'socket.io-client';
const socket = io('https://chatmeetupserver.onrender.com');

export { socket };