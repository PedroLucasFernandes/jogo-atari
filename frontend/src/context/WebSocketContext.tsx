import React, { createContext, useContext, useEffect, useState } from 'react';
import { webSocketService } from '../services/WebSocketService';
import { IGameState, initialBallState, initialCanvasState, initialPlayersState, initialRoomState, initialWallsState, IRoomState } from '../interfaces/game';
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
  movePlayer: (keyPressed: string) => void;
  startGame: () => void;
  gameState: IGameState | null;
  roomState: IRoomState | null;
  rooms: IRoomState[] | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [gameState, setGameState] = useState<IGameState | null>(null);
  const [roomState, setRoomState] = useState<IRoomState | null>(null);
  const [rooms, setRooms] = useState<IRoomState[] | null>(null);

  const { user } = useUser();




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

    webSocketService.registerCallback('roomsReceived', (data) => {
      console.log(`Retorno - lista de salas recebidas: ${data}`);

      const rooms = data.data.rooms;

      if (!rooms) {
        console.log("Erro ao receber salas");
        return;
      }

      setRooms(rooms)
      console.log("Retorno - salas recebidas: rooms setado");
    });

    webSocketService.registerCallback('roomCreated', (data) => {
      console.log(`Retorno - sala criada: ${data}`);

      const roomState = data.data.roomState;

      if (!roomState) {
        console.log("Erro ao indentificar sala");
        return;
      }

      if (roomState.players.length === 0) {
        console.log("Erro ao indentificar jogador na sala");
        return;
      }

      setRoomState(data.data.roomState)
      console.log("Retorno - sala criada: roomState setado");
    });

    webSocketService.registerCallback('playerJoined', (data) => {
      console.log(`Retorno - entrou na sala: ${data}`);

      const roomState = data.data.roomState;

      if (!roomState) {
        console.log("Erro ao indentificar sala");
        return;
      }

      if (roomState.players.length === 0) {
        console.log("Erro ao indentificar jogadores na sala");
        return;
      }

      setRoomState(roomState)
      console.log("Retorno - entrou na sala: roomState setado");
    });

    webSocketService.registerCallback('gameStarted', (data) => {
      console.log(`Jogo iniciado: ${data}`);
      setGameState(data.data.gameState)
    });

    webSocketService.registerCallback('movePlayer', (data) => {
      console.log(`Jogador se moveu: ${JSON.stringify(data)}`);
      setGameState(data.data.gameState)
    });

    webSocketService.registerCallback('moveBall', (data) => {
      //console.log(`Bola se moveu: ${JSON.stringify(data)}`);
      // Verifica se a mensagem contém a propriedade 'data' e 'ball'
      if (data.data && data.data.ball) {
        setGameState(prevGameState => {
          // Se o estado anterior for nulo, você pode retornar um novo estado inicial
          if (prevGameState === null) {
            return {
              players: initialPlayersState,
              walls: initialWallsState,
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
            }
          };
        });
      } else {
        console.error('Erro ao atualizar o estado da bola:', data);
      }
    });

  }, []);


  const getRooms = () => {
    if (!socketId) {
      //Todo: Alerta
      console.log('Can\'t request rooms without a socketId');
      return;
    }

    webSocketService.send({ type: 'getRooms' });
  }

  const createRoom = (code: string) => {
    if (!socketId || !user) {
      //Todo: Alerta
      console.log('Can\'t create room without a socketId or user context');
      return;
    }

    const data = { playerId: socketId, username: user.username, code: code, }
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

  const joinRoom = (roomId: string, code: string) => {
    if (!socketId || !user) {
      //Todo: Alerta
      console.log('Can\'t join in a room without a socketId or user context');
      return;
    }

    if (!roomId || !code) {
      //Todo: Alerta
      console.log('Id da sala ou código não informados ou nulos');
      return;
    }

    const data = { playerId: socketId, username: user.username, roomId: roomId, code: code }
    webSocketService.send({ type: 'joinRoom', data });
  }

  const leaveRoom = (roomId: string) => {
    if (!socketId) {
      //Todo: Alerta
      console.log('Can\'t leave room without a socketId');
      return;
    }

    const data = { roomId: roomId, playerId: socketId }
    webSocketService.send({ type: 'leaveRoom', data });
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
      getRooms, createRoom, closeRoom, joinRoom, leaveRoom, movePlayer, startGame, gameState, roomState, rooms
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
