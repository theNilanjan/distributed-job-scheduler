import { io } from 'socket.io-client';
import { getAccessToken } from './authStorage';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      autoConnect: false,
      auth: () => ({ token: getAccessToken() })
    });
  }
  return socket;
}
