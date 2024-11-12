import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { webSocketService } from '../services/WebSocketService';
import { IGameMessage, IGameState, IWinner, initialBallState, initialCanvasState, initialPlayersState, initialRoomState, initialPlanetsState, IRoomState, IMove, PlayersRecord, IPlayer } from '../interfaces/game';
import { useUser } from './UserContext';
import { gameAudio } from '../utils/audioManager';
import { movePlayerPredict } from '../services/game';

interface WebSocketContextType {
  //isConnected: boolean; // removido, socketId já faz essa função
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
  leaveGame: (roomId: string) => void;
  setLastMessage: (message: IGameMessage | null) => void;
  checkGameInProgress: () => void;
  gameState: IGameState | null;
  roomState: IRoomState | null;
  rooms: IRoomState[] | null;
  lastMessage: IGameMessage | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  //const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [gameState, setGameState] = useState<IGameState | null>(null);
  const [roomState, setRoomState] = useState<IRoomState | null>(null);
  const [rooms, setRooms] = useState<IRoomState[] | null>(null);
  const [lastMessage, setLastMessage] = useState<IGameMessage | null>(null);

  const { user } = useUser();

  const [moveNumber, setMoveNumber] = useState<number>(0);
  const [moveHistory, setMoveHistory] = useState<IMove[]>([]);
  const gameStateRef = useRef<IGameState | null>(gameState);
  const socketIdRef = useRef<string | null>(socketId);


  function updateTarget(playerId: string, x: number, y: number) {
    if (!gameState) {
      return;
    }

    const player = gameState.players[playerId];

    if (!player) {
      return;
    }

    player.toX = x;
    player.toY = y;
  }


  useEffect(() => {
    if (!user) {
      if (socketId) {
        webSocketService.disconnect();
        gameAudio.stopAll(); // Stop all audio when disconnecting
        setStatus('offline');
        setGameState(null);
        setRoomState(null);
        setRooms(null);
        setLastMessage(null);
        console.log("Disconnecting websocket and clearing data");
        return;
      }

      console.log("User is not logged in, websocket will not connect");
      return;
    }

    const connectWebSocket = () => {
      webSocketService.connect();
    };
    connectWebSocket();

    webSocketService.registerCallback('uuid', (data) => {
      setSocketId(data.socketId);
      setStatus('online');
    });

    webSocketService.registerCallback('gameInProgress', (data) => {
      console.log("tem jogo em progresso");
      const roomState = data.data.roomState;

      if (!roomState) {
        console.log("Erro ao indentificar estado da sala");
        setLastMessage({ type: 'error', data: { message: 'Erro ao carregar dados da sala em andamento. Unexpected server response' } });
        return;
      }

      const gameState = data.data.gameState;

      if (!gameState) {
        console.log("Erro ao identificar estado do jogo");
        setLastMessage({ type: 'error', data: { message: 'Erro ao carregar dados do jogo em andamento. Unexpected server response' } });
        return;
      }

      setLastMessage(data)
      setRoomState(roomState);
      setGameState(gameState);
    });

    webSocketService.registerCallback('roomsReceived', (data) => {

      const rooms = data.data.rooms;

      if (!rooms) {
        console.log("Erro ao receber salas");
        setLastMessage({ type: 'error', data: { message: 'Erro ao carregar salas' } });
        return;
      }

      setRooms(rooms)
    });

    webSocketService.registerCallback('roomCreated', (data) => {
      const roomState = data.data.roomState;

      if (!roomState) {
        console.log("Erro ao indentificar estado da sala");
        setLastMessage({ type: 'error', data: { message: 'Erro ao criar sala. Unexpected server response' } });
        return;
      }

      setRoomState(data.data.roomState)
    });

    webSocketService.registerCallback('roomClosed', (data) => {
      const roomId = data.data.roomId;

      /* if (!roomId) {
        console.log("Erro ao identificar salas");
        return;
      }

      if (!roomState) {
        return;
      }

      if (roomState.roomId !== roomId) {
        return;
      } */
      console.log("roomState: " + JSON.stringify(roomState));
      setLastMessage(data);
      setRoomState(null);
    });

    webSocketService.registerCallback('playerJoined', (data) => {

      const roomState = data.data.roomState;

      if (!roomState) {
        console.log("Erro ao indentificar estado da sala");
        setLastMessage({ type: 'error', data: { message: 'Erro ao receber novo jogador. Unexpected server response' } });
        return;
      }

      if (roomState.players.length === 0) {
        console.log("Erro ao indentificar jogadores na sala");
        setLastMessage({ type: 'error', data: { message: 'Erro ao receber novo jogador. Unexpected server response' } });
        return;
      }

      setLastMessage(data);
      setRoomState(roomState)
    });

    webSocketService.registerCallback('playerLeft', (data) => {
      const roomState = data.data.roomState;

      if (!roomState) {
        console.log("Erro ao indentificar estado da sala");
        setLastMessage({ type: 'error', data: { message: 'Erro ao atualizar jogadores. Unexpected server response' } });
        return;
      }

      setLastMessage(data);
      setRoomState(roomState)
    });

    webSocketService.registerCallback('youLeft', (data) => {
      console.log(`Retorno - youLeft: ${data}`);

      setLastMessage(data);
      setRoomState(null)
    });

    webSocketService.registerCallback('youAreRemoved', (data) => {
      console.log(`Retorno - youLeft: ${data}`);

      setLastMessage(data);
      setRoomState(null)
    });

    webSocketService.registerCallback('playerStatusChanged', (data) => {
      const roomState = data.data.roomState;

      if (!roomState) {
        console.log("Erro ao indentificar estado da sala");
        setLastMessage({ type: 'error', data: { message: 'Erro ao atualizar jogadores. Unexpected server response' } });
        return;
      }

      setLastMessage(data);
      setRoomState(roomState)
    });

    webSocketService.registerCallback('playerRemoved', (data) => {
      const roomState = data.data.roomState;

      if (!roomState) {
        console.log("Erro ao indentificar estado da sala");
        setLastMessage({ type: 'error', data: { message: 'Erro ao atualizar jogadores. Unexpected server response' } });
        return;
      }

      setLastMessage(data);
      setRoomState(roomState)
    })

    webSocketService.registerCallback('gameStarted', (data) => {
      const roomState = data.data.roomState;
      const gameState = data.data.gameState;

      if (!roomState) {
        console.log("Erro ao indentificar estado da sala");
        setLastMessage({ type: 'error', data: { message: 'Erro ao iniciar jogo. Unexpected server response' } });
        return;
      }

      if (!gameState) {
        console.log("Erro ao identificar estado do jogo");
        setLastMessage({ type: 'error', data: { message: 'Erro ao iniciar jogo. Unexpected server response' } });
        return;
      }

      gameAudio.startBackgroundMusic();
      setLastMessage(data);
      setRoomState(roomState);
      setGameState(data.data.gameState)
    });

    webSocketService.registerCallback('playerMoved', (data) => {
      //setGameState(data.data.gameState)

      const playerId = data.data.playerId;
      console.log("Player Id: " + playerId);
      console.log("Socket Id: " + socketIdRef.current);

      if (!playerId) {
        console.log("Erro ao identificar jogador");
        setLastMessage({ type: 'error', data: { message: 'Erro ao identificar jogador movimentado. Unexpected server response' } });
        return;
      }
      console.log("gamestateref", gameStateRef.current);

      if (playerId === socketIdRef.current) {
        //validateAndReconcile(localPlayer, update);
        console.log("reconciliação");
      }
      else if (gameStateRef.current && gameStateRef.current.players[playerId]) {
        console.log("interpolação");
        updateTarget(data.data.playeId, data.data.move.x, data.data.move.y);

      }


    });

    webSocketService.registerCallback('playerLeftGame', (data) => {
      console.log(`Retorno - playerLeftGame: ${data}`);
      const roomState = data.data.roomState;
      const gameState = data.data.gameState;

      console.log("Room state: " + JSON.stringify(roomState));
      console.log(`Game state: "${JSON.stringify(gameState)}`);

      if (!roomState) {
        console.log("Erro ao indentificar estado da sala");
        setLastMessage({ type: 'error', data: { message: 'Erro ao atualizar jogadores. Unexpected server response' } });
        return;
      }

      if (!gameState) {
        console.log("Erro ao indentificar estado do jogo");
        setLastMessage({ type: 'error', data: { message: 'Erro ao atualizar jogadores. Unexpected server response' } });
        return;
      }

      setLastMessage(data);
      setRoomState(roomState);
      setGameState(gameState);
    });

    webSocketService.registerCallback('youLeftGame', (data) => {
      console.log(`Retorno - youLeftGame: ${data}`);

      setLastMessage(data);
      setRoomState(null);
      setGameState(null);
    });

    webSocketService.registerCallback('updateBall', (data) => {
      if (data.data && data.data.ball) {
        // Check for collisions by comparing with previous state
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
        setLastMessage({ type: 'error', data: { message: 'Erro ao processar jogo. Unexpected server response' } });
      }
    });

    webSocketService.registerCallback('updatePlanet', (data) => {
      if (data.data && data.data.planets) {
        // Play destruction sound when a planet part is destroyed
        if (data.data.planetDestruction) {
          gameAudio.playDestructionSound();
        }
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
        gameAudio.stopAll();
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
        setLastMessage({ type: 'error', data: { message: 'Erro ao processar jogo. Unexpected server response' } });
      }
    });
  }, [user]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    socketIdRef.current = socketId;
  }, [socketId]);



  const checkGameInProgress = () => {
    console.log("checkGameInProgress");
    if (!socketId) {
      setLastMessage({ type: 'error', data: { message: 'Falha ao conectar com o servidor' } });
      console.log('Can\'t check game sessions without a socketId');
      return;
    }

    const data = { playerId: socketId }
    webSocketService.send({ type: 'checkGameInProgress', data });
  }

  const getRooms = () => {
    if (!socketId) {
      setLastMessage({ type: 'error', data: { message: 'Falha ao conectar com o servidor' } });
      console.log('Can\'t request rooms without a socketId');
      return;
    }

    webSocketService.send({ type: 'getRooms' });
  }

  const createRoom = (code: string) => {
    if (!socketId || !user) {
      setLastMessage({ type: 'error', data: { message: 'Falha ao conectar com o servidor' } });
      console.log('Can\'t create room without a socketId or user context');
      return;
    }

    const data = { playerId: socketId, username: user.username, code: code, }
    webSocketService.send({ type: 'createRoom', data });
  }

  const closeRoom = (roomId: string) => {
    if (!socketId) {
      setLastMessage({ type: 'error', data: { message: 'Falha ao identificar sala' } });
      console.log('Can\'t close a room without a socketId');
      return;
    }

    const data = { roomId: roomId, playerId: socketId }
    webSocketService.send({ type: 'closeRoom', data });
  }

  const joinRoom = (roomId: string, code: string) => {
    if (!socketId || !user) {
      setLastMessage({ type: 'error', data: { message: 'Falha ao conectar com o servidor' } });
      console.log('Can\'t join in a room without a socketId or user context');
      return;
    }

    if (!roomId) {
      setLastMessage({ type: 'error', data: { message: 'Falha ao identificar' } });
      console.log('Id da sala ou código não informados ou nulos');
      return;
    }

    if (!code) {
      setLastMessage({ type: 'error', data: { message: 'Código inválido' } });
      console.log('Id da sala ou código não informados ou nulos');
      return;
    }

    const data = { playerId: socketId, username: user.username, roomId: roomId, code: code }
    webSocketService.send({ type: 'joinRoom', data });
  }

  const leaveRoom = (roomId: string) => {
    if (!socketId) {
      setLastMessage({ type: 'error', data: { message: 'Falha ao conectar com o servidor' } });
      console.log('Can\'t leave room without a socketId');
      return;
    }

    gameAudio.stopAll();
    const data = { roomId: roomId, playerId: socketId }
    webSocketService.send({ type: 'leaveRoom', data });
  }

  const toggleReadyStatus = (roomId: string) => {
    if (!socketId) {
      setLastMessage({ type: 'error', data: { message: 'Falha ao conectar com o servidor' } });
      console.log('Can\'t toggle ready status without a socketId');
      return;
    }

    const data = { roomId: roomId, playerId: socketId }
    webSocketService.send({ type: 'toggleReadyStatus', data });
  }

  const removePlayer = (roomId: string, playerId: string) => {
    if (!socketId) {
      setLastMessage({ type: 'error', data: { message: 'Falha ao conectar com o servidor' } });
      console.log('Can\'t remove player without a socketId');
      return;
    }

    const data = { roomId: roomId, playerId: playerId }
    webSocketService.send({ type: 'removePlayer', data });
  }

  const startGame = (roomId: string) => { // Primeiro teste websocket
    if (!socketId) {
      setLastMessage({ type: 'error', data: { message: 'Falha ao conectar com o servidor' } });
      console.log('Can\'t start game without a socketId');
      return;
    }

    const data = { roomId: roomId, playerId: socketId }
    webSocketService.send({ type: 'startGame', data });
  }

  const movePlayer = (roomId: string, keyPressed: string) => {
    if (!socketId) {
      setLastMessage({ type: 'error', data: { message: 'Falha ao conectar com o servidor' } });
      console.log('Can\'t move player without a socketId');
      return;
    }

    if (!gameState) {
      console.error('Can\'t move player without a gameState');
      return;
    }

    const move = movePlayerPredict(gameState, socketId, keyPressed);
    const player = gameState.players[socketId];

    if (!player || !move) {
      console.error('Can\'t move player.');
      return;
    }

    console.log("move", move);

    const updatedPlayer = {
      ...player,
      x: move.x,
      y: move.y
    };

    const updatedPlayers = {
      ...gameState.players,
      [socketId]: updatedPlayer
    };

    console.log("updatedPlayers", updatedPlayers);

    setGameState(prevState => {
      if (!prevState) return null;
      return {
        ...prevState,
        players: updatedPlayers
      };
    });

    console.log("setGameState", gameState);

    addMoveOnHistory(move.direction, move.x, move.y);

    const data = { roomId: roomId, keyPressed: keyPressed, moveNumber, playerId: socketId }
    webSocketService.send({ type: 'movePlayer', data });
  }

  const leaveGame = (roomId: string) => {
    if (!socketId) {
      setLastMessage({ type: 'error', data: { message: 'Falha ao conectar com o servidor' } });
      console.log('Can\'t leave match without a socketId');
      return;
    }

    const data = { roomId: roomId, playerId: socketId }
    webSocketService.send({ type: 'leaveGame', data });
  }

  function addMoveOnHistory(direction: string, x: number, y: number) {
    setMoveNumber(moveNumber => moveNumber + 1);

    const newMove = {
      moveNumber,
      direction,
      x,
      y,
    };

    setMoveHistory(prevMoveHistory => [...prevMoveHistory, newMove]);
  }

  return (
    <WebSocketContext.Provider value={{
      socketId, webSocketService, status, gameState, roomState, rooms, lastMessage,
      getRooms, createRoom, closeRoom, joinRoom, leaveRoom, toggleReadyStatus, removePlayer, movePlayer,
      startGame, leaveGame, setLastMessage, checkGameInProgress
      // Opção para criar um botão de liga e desliga áudio
      // toggleAudio: gameAudio.toggleMute.bind(gameAudio), // Add audio toggle function
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