import React, { createContext, useContext, useEffect, useState } from 'react';
import { webSocketService } from '../services/WebSocketService';
import { IGameState } from '../interfaces/game';

interface WebSocketContextType {
  isConnected: boolean;
  socketId: string | null;
  webSocketService: typeof webSocketService;
  status: string | null;  //'offline' | 'online' | 'finding' | 'room' | 'game' | 'disconnected';
  createRoom: (code: string) => void;
  closeRoom: (roomId: string) => void;
  joinRoom: (code: string) => void;
  exitRoom: (roomId: string) => void;
  movePlayer: (keyPressed: string) => void;
  startGame: () => void;
  gameState: IGameState | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [gameState, setGameState] = useState<IGameState | null>(null);


  useEffect(() => {
    const connectWebSocket = () => {
      webSocketService.connect();
    };
    connectWebSocket();

    webSocketService.registerCallback('uuid', (data) => {
      console.log(`UUID recebido: ${data.socketId}`);
      setSocketId(data.socketId);
      setStatus('online');
    });

    webSocketService.registerCallback('gameStarted', (data) => {
      console.log(`Jogo iniciado: ${data}`);
      setGameState(data.data.gameState)
    });

  }, []);


  const createRoom = (code: string) => {
    if (!socketId) {
      //Todo: Alerta
      console.log('Can\'t create room without a socketId');
      return;
    }

    const data = { code: code, playerId: socketId }
    webSocketService.send({ type: 'createRoom', data });
  }

  const closeRoom = (roomId: string) => {
    if (!socketId) {
      //Todo: Alerta
      console.log('Can\'t close a room without a socketId');
      return;
    }

    const data = { roomId: roomId, playerId: socketId }
    webSocketService.send({ type: 'closeRoom', data });
  }

  const joinRoom = (code: string) => {
    if (!socketId) {
      //Todo: Alerta
      console.log('Can\'t join in a room without a socketId');
      return;
    }

    const data = { code: code, playerId: socketId }
    webSocketService.send({ type: 'joinRoom', data });
  }

  const exitRoom = (roomId: string) => {
    if (!socketId) {
      //Todo: Alerta
      console.log('Can\'t join in a room without a socketId');
      return;
    }

    const data = { roomId: roomId, playerId: socketId }
    webSocketService.send({ type: 'exitRoom', data });
  }

  const startGame = () => { // Primeiro teste websocket
    if (!socketId) {
      //Todo: Alerta
      console.log('Can\'t start game without a socketId');
      return;
    }

    const data = { playerId: socketId }
    webSocketService.send({ type: 'startGame', data });
  }

  const movePlayer = (keyPressed: string) => {
    if (!socketId) {
      //Todo: Alerta
      console.log('Can\'t move player without a socketId');
      return;
    }

    const data = { keyPressed: keyPressed, playerId: socketId }
    webSocketService.send({ type: 'movePlayer', data });
  }

  return (
    <WebSocketContext.Provider value={{
      isConnected, socketId, webSocketService, status,
      createRoom, closeRoom, joinRoom, exitRoom, movePlayer, startGame, gameState
    }}>
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
