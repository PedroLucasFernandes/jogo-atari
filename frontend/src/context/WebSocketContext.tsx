import React, { createContext, useContext, useEffect, useState } from 'react';
import { webSocketService } from '../services/WebSocketService';

interface WebSocketContextType {
  isConnected: boolean;
  socketId: string | null;
  webSocketService: typeof webSocketService;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      webSocketService.connect();
    };

    connectWebSocket();

    webSocketService.registerCallback('uuid', (data) => {
      console.log(`UUID recebido: ${data.socketId}`);
      setSocketId(data.socketId);
    });

    /*  return () => {
       webSocketService.disconnect();
       setIsConnected(false);
     }; */
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, socketId, webSocketService }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
