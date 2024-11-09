import React, { createContext, useContext, useEffect, useState } from 'react';
import { webSocketService } from '../services/WebSocketService';
import { IGameMessage, IGameState, IWinner, initialBallState, initialCanvasState, initialPlayersState, initialRoomState, initialPlanetsState, IRoomState } from '../interfaces/game';
import { useUser } from './UserContext';

interface WebSocketContextType {
  isConnected: boolean;
  socketId: string | null;
  webSocketService: typeof webSocketService;
  status: string | null;  //'offline' | 'online' | 'finding' | 'room' | 'game' | 'disconnected';
  getRooms: () => void;
  createRoom: (code: string) => void;
  closeRoom: (roomId: string) => void;
  joinRoom: (roomId: string, code: string) => void;
  leaveRoom: (roomId: string) => void;
  toggleReadyStatus: (roomId: string) => void;
  removePlayer: (roomId: string, playerId: string) => void;
  movePlayer: (roomId: string, keyPressed: string) => void;
  startGame: (roomId: string) => void;
  gameState: IGameState | null;
  roomState: IRoomState | null;
  rooms: IRoomState[] | null;
  lastMessage: IGameMessage | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [gameState, setGameState] = useState<IGameState | null>(null);
  const [roomState, setRoomState] = useState<IRoomState | null>(null);
  const [rooms, setRooms] = useState<IRoomState[] | null>(null);
  const [lastMessage, setLastMessage] = useState<IGameMessage | null>(null);

  const { user } = useUser();

  useEffect(() => {
    const connectWebSocket = () => {
      webSocketService.connect();
    };
    connectWebSocket();

    webSocketService.registerCallback('uuid', (data) => {
      setSocketId(data.socketId);
      setStatus('online');
    });

    webSocketService.registerCallback('roomsReceived', (data) => {

      const rooms = data.data.rooms;

      if (!rooms) {
        return;
      }

      setRooms(rooms)
    });

    webSocketService.registerCallback('roomCreated', (data) => {
      const roomState = data.data.roomState;

      if (!roomState) {
        return;
      }

      if (roomState.players.length === 0) {
        return;
      }

      setRoomState(data.data.roomState)
    });

    webSocketService.registerCallback('roomClosed', (data) => {
      const roomId = data.data.roomId;

      if (!roomId) {
        return;
      }

      if (!roomState) {
        return;
      }

      if (roomState.roomId !== roomId) {
        return;
      }

      setLastMessage(data.data);
      setRoomState(null);
    });

    webSocketService.registerCallback('playerJoined', (data) => {

      const roomState = data.data.roomState;

      if (!roomState) {
        return;
      }

      if (roomState.players.length === 0) {
        return;
      }

      setLastMessage(data.data);
      setRoomState(roomState)
    });

    webSocketService.registerCallback('playerLeft', (data) => {
      const roomState = data.data.roomState;

      if (!roomState) {
        return;
      }

      setLastMessage(data.data);
      setRoomState(roomState)
    });

    webSocketService.registerCallback('playerStatusChanged', (data) => {
      const roomState = data.data.roomState;

      if (!roomState) {
        return;
      }

      setLastMessage(data.data);
      setRoomState(roomState)
    });

    webSocketService.registerCallback('playerRemoved', (data) => {
      const roomState = data.data.roomState;

      if (!roomState) {
        return;
      }

      setLastMessage(data.data);
      setRoomState(roomState)
    })

    webSocketService.registerCallback('gameStarted', (data) => {
      const roomState = data.data.roomState;
      const gameState = data.data.gameState;

      if (!roomState) {
        return;
      }

      if (!gameState) {
        return;
      }

      setLastMessage(data.data);
      setRoomState(roomState);
      setGameState(data.data.gameState)
    });

    webSocketService.registerCallback('playerMoved', (data) => {
      setGameState(data.data.gameState)
    });

    webSocketService.registerCallback('updateBall', (data) => {
      if (data.data && data.data.ball) {
        setGameState(prevGameState => {
          // Se o estado anterior for nulo, você pode retornar um novo estado inicial
          if (prevGameState === null) {
            return {
              players: initialPlayersState,
              planets: initialPlanetsState,
              ball: initialBallState,
              canvas: initialCanvasState,
              room: initialRoomState,
            };
          }

          // Atualiza o estado do jogo
          return {
            ...prevGameState,
            ball: {
              ...prevGameState.ball, // Mantém as propriedades existentes da bola
              ...data.data.ball    // Atualiza apenas as propriedades recebidas na mensagem
            },
          };
        });
      } else {
        console.error('Erro ao atualizar o estado da bola:', data);
      }
    });
  
    webSocketService.registerCallback('updatePlanet', (data) => {
      if (data.data && data.data.planets) {
        setGameState(prevGameState => {
          // Se o estado anterior for nulo, você pode retornar um novo estado inicial
          if (prevGameState === null) {
            return {
              players: initialPlayersState,
              planets: initialPlanetsState,
              ball: initialBallState,
              canvas: initialCanvasState,
              room: initialRoomState
            };
          }

          // Atualiza o estado do jogo
          return {
            ...prevGameState,
            planets: data.data.planets,
          };
        });
      } else {
        console.error('Erro ao atualizar o estado dos planetas:', data);
      }
    });

    webSocketService.registerCallback('gameOver', (data) => {
      if (data.data && data.data.winner) {
        setGameState(prevGameState => {
             // Atualiza o estado do jogo
          return {
            ...prevGameState as IGameState,
            winner: {
              username: data.data.winner.username,
              id: data.data.winner.id
            } as IWinner,
          };
        });
        setRoomState(null);  // Limpar o estado da sala após a vitória
        setLastMessage(data.data);
      } else {
        console.error('Erro ao atualizar o estado dos planetas:', data);
      }
    });
  }, []);
  
  const getRooms = () => {
    if (!socketId) {
      //Todo: Alerta
      return;
    }

    webSocketService.send({ type: 'getRooms' });
  }

  const createRoom = (code: string) => {
    if (!socketId || !user) {
      //Todo: Alerta
      return;
    }

    const data = { playerId: socketId, username: user.username, code: code, }
    webSocketService.send({ type: 'createRoom', data });
  }

  const closeRoom = (roomId: string) => {
    if (!socketId) {
      //Todo: Alerta
      return;
    }

    const data = { roomId: roomId, playerId: socketId }
    webSocketService.send({ type: 'closeRoom', data });
  }

  const joinRoom = (roomId: string, code: string) => {
    if (!socketId || !user) {
      //Todo: Alerta
      return;
    }

    if (!roomId || !code) {
      //Todo: Alerta
      return;
    }

    const data = { playerId: socketId, username: user.username, roomId: roomId, code: code }
    webSocketService.send({ type: 'joinRoom', data });
  }

  const leaveRoom = (roomId: string) => {
    if (!socketId) {
      //Todo: Alerta
      return;
    }

    const data = { roomId: roomId, playerId: socketId }
    webSocketService.send({ type: 'leaveRoom', data });
  }

  const toggleReadyStatus = (roomId: string) => {
    if (!socketId) {
      //Todo: Alerta
      return;
    }

    const data = { roomId: roomId, playerId: socketId }
    webSocketService.send({ type: 'toggleReadyStatus', data });
  }

  const removePlayer = (roomId: string, playerId: string) => {
    if (!socketId) {
      return;
    }

    const data = { roomId: roomId, playerId: playerId }
    webSocketService.send({ type: 'removePlayer', data });
  }

  const startGame = (roomId: string) => { // Primeiro teste websocket
    if (!socketId) {
      //Todo: Alerta
      return;
    }

    const data = { roomId: roomId, playerId: socketId }
    webSocketService.send({ type: 'startGame', data });
  }

  const movePlayer = (roomId: string, keyPressed: string) => {
    if (!socketId) {
      //Todo: Alerta
      return;
    }

    const data = { roomId: roomId, keyPressed: keyPressed, playerId: socketId }
    webSocketService.send({ type: 'movePlayer', data });
  }


  return (
    <WebSocketContext.Provider value={{
      isConnected, socketId, webSocketService, status, gameState, roomState, rooms, lastMessage,
      getRooms, createRoom, closeRoom, joinRoom, leaveRoom, toggleReadyStatus, removePlayer, movePlayer, startGame,
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