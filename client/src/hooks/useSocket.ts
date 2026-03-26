import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// This tells the Client to look for the Server at port 3000
const SOCKET_URL = 'http://localhost:3000';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const s = io(SOCKET_URL);
    setSocket(s);

    s.on('connect', () => {
      console.log('NEXUS UPLINK ESTABLISHED');
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    // Clean up when you close the tab
    return () => {
      s.close();
    };
  }, []);

  return { socket, isConnected };
};