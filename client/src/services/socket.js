import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

let socket;

export const initializeSocket = (userId) => {
  if (!userId) return null;
  
  // Close existing socket if any
  if (socket) socket.close();
  
  // Create new socket connection
  socket = io(API_URL, {
    transports: ['websocket'],
    autoConnect: true
  });
  
  // Handle connection
  socket.on('connect', () => {
    console.log('Socket connected');
    
    // Authenticate with user ID
    socket.emit('authenticate', userId);
  });
  
  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  return socket;
};

export const getSocket = () => socket;

export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

export const sendMessage = (recipientId, content, conversationId) => {
  if (!socket) return;
  
  socket.emit('send_message', {
    recipientId,
    content,
    conversationId
  });
};

export const sendTypingIndicator = (conversationId, recipientId) => {
  if (!socket) return;
  
  socket.emit('typing', {
    conversationId,
    recipientId
  });
};

export default {
  initializeSocket,
  getSocket,
  closeSocket,
  sendMessage,
  sendTypingIndicator
};