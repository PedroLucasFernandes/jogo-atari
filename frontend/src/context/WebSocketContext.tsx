import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { webSocketService } from '../services/WebSocketService';
import { IGameMessage, IGameState, IWinner, initialBallState, initialCanvasState, initialPlayersState, initialRoomState, initialPlanetsState, IRoomState, IMove, PlayersRecord, IPlayer, IChatMessage, initialInfoState } from '../interfaces/game';
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
  sendChatMessage: (roomId: string, chatMessage: string) => void;
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
  lastChatMessage: IChatMessage | null;
  setGameState: (gameState: IGameState | null) => void;
  setRoomState: (roomState: IRoomState | null) => void;
  setLastChatMessage: (chatMessage: IChatMessage | null) => void;

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
  const [lastChatMessage, setLastChatMessage] = useState<IChatMessage | null>(null);

  const { user, setUser } = useUser();

  const [moveNumber, setMoveNumber] = useState<number>(0);
  const [moveHistory, setMoveHistory] = useState<IMove[]>([]);
  const [isReconciling, setIsReconciling] = useState<boolean>(false);
  const gameStateRef = useRef<IGameState | null>(gameState);
  const socketIdRef = useRef<string | null>(socketId);
  const moveNumberRef = useRef<number | null>(moveNumber);

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
      getRooms();
    };
    connectWebSocket();

    webSocketService.registerCallback('uuid', (data) => {
      setSocketId(data.socketId);
      setUser(prevUser => ({ ...prevUser!, color: data.color }))
      setStatus('online');
    });
  }, [user]);

  useEffect(() => {
    if (!user || !socketId) return;

    webSocketService.registerCallback('error', (data) => {
      const error = data.data.message;
      if (error) {
        setLastMessage(error)
      }
    });

    webSocketService.registerCallback('gameInProgress', (data) => {
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

    webSocketService.registerCallback('receivedChatMessage', (data) => {
      const chatMessage = data.data.chatMessage;
      console.log("chegou", chatMessage);

      if (!chatMessage) {
        console.log("Erro ao processar mensagem de chat. Unexpected server response");
        return;
      }
      setLastChatMessage(chatMessage);
      /* setTimeout(() => {
      }, 10000); */

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

        // Trocar a música assim que o jogo começar
      if (gameAudio.isPlayingHomeMusic) {
        gameAudio.stopAll();
      }
      gameAudio.startBackgroundMusic();
      gameAudio.saveAudioState();

      setLastMessage(data);
      setRoomState(roomState);
      setGameState(data.data.gameState)
    });

    webSocketService.registerCallback('playerMoved', (data) => {
      //setGameState(data.data.gameState)

      const playerId = data.data.playerId;

      if (!playerId) {
        console.log("Erro ao identificar jogador");
        setLastMessage({ type: 'error', data: { message: 'Erro ao identificar jogador movimentado. Unexpected server response' } });
        return;
      }

      const serverMovement = data.data.move;
      if (!serverMovement) {
        console.log("Erro ao identificar movimento do jogador");
        setLastMessage({ type: 'error', data: { message: 'Erro ao identificar jogador movimentado. Unexpected server response' } });
        return;
      }


      if (playerId === socketIdRef.current) {
        validateAndReconcile(data.data.move);
        console.log("reconciliação");
      }
      //else if (gameStateRef.current && gameStateRef.current.players[playerId]) {
      else if (gameState && gameState.players[playerId]) {
        console.log("interpolação");
        updateTarget(data.data.move.x, data.data.move.y, data.data.playerId);

      }
    });

    webSocketService.registerCallback('playerLeftGame', (data) => {
      const roomState = data.data.roomState;
      const gameState = data.data.gameState;

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
      setLastMessage(data);
      setRoomState(null);
      setGameState(null);
    });

    webSocketService.registerCallback('updateBall', (data) => {
      const position = data.data.position;

      if (!position) {
        console.error('Erro ao atualizar a posição da bola:', data);
        setLastMessage({ type: 'error', data: { message: 'Erro ao atualizar a posição da bola. Unexpected server response' } });
        return;
      }

      updateTarget(position.x, position.y);
    });

    // webSocketService.registerCallback('updatePlayerActive', (data) => {
    //   const playerActive = data.data.playerActive;
    //   const playerId = data.data.playerId;
    //   console.log("Dados chegando sobre atualização do player no front", data)
    //   if (data.data && playerActive !== undefined && playerId) {        
    //     setGameState(prevGameState => {
    //       if (prevGameState === null) {
    //         return {
    //           players: initialPlayersState,
    //           planets: initialPlanetsState,
    //           ball: initialBallState,
    //           canvas: initialCanvasState,
    //           room: initialRoomState
    //         };
    //       }

    //       // Atualiza o estado 'active' do jogador específico
    //       return {
    //         ...prevGameState,
    //         players: {
    //           ...prevGameState.players,
    //           [data.playerId]: {
    //             ...prevGameState.players[playerId],
    //             active: playerActive
    //           }
    //         }
    //       };
    //     });
    //     console.log("Estado dos players no jogo depois de atualizar o active", gameState?.players)
    //   } else {
    //     console.error('Erro ao atualizar o estado do jogador:', data);
    //   }
    // });

    webSocketService.registerCallback('updatePlayerActive', (data) => {
      console.log("Dados chegando sobre atualização do player no front", data);

      if (data.data && data.data.playerActive !== undefined && data.data.playerId) {
        setGameState(prevGameState => {
          if (prevGameState === null) {
            return {
              players: initialPlayersState,
              planets: initialPlanetsState,
              ball: initialBallState,
              canvas: initialCanvasState,
              room: initialRoomState,
              info: initialInfoState
            };
          }

          const updatedGameState = {
            ...prevGameState,
            players: {
              ...prevGameState.players,
              [data.data.playerId]: {
                ...prevGameState.players[data.data.playerId],
                active: data.data.playerActive
              }
            }
          };

          // Atualiza gameStateRef com o novo estado
          gameStateRef.current = updatedGameState;
          return updatedGameState;
        });

        console.log("Estado dos players no jogo depois de atualizar o active", gameStateRef.current?.players);
      } else {
        console.error('Erro ao atualizar o estado do jogador:', data);
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
              room: initialRoomState,
              info: initialInfoState
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
        // gameAudio.stopAll();
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

    webSocketService.registerCallback('infoUpdated', (data) => {
      const info = data.data.info;

      if (!info) {
        console.error('Erro ao atualizar a informações da partida:', data);
        setLastMessage({ type: 'error', data: { message: 'Erro ao atualizar a informações da partida. Unexpected server response' } });
        return;
      }

      setGameState(prevGameState => {
        if (prevGameState === null) {
          return {
            players: initialPlayersState,
            planets: initialPlanetsState,
            ball: initialBallState,
            canvas: initialCanvasState,
            room: initialRoomState,
            info: initialInfoState
          };
        }
        return {
          ...prevGameState,
          info
        };
      })
    });

  }, [socketId, user, roomState, gameState, moveNumber, moveHistory, isReconciling, updateTarget,
    validateAndReconcile, addMoveOnHistory, getMoveFromSequenceNumber, getAndDeleteUnacknowledgedMoves, keepUnacknowledgedMoves]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    socketIdRef.current = socketId;
  }, [socketId]);

  useEffect(() => {
    moveNumberRef.current = moveNumber;
  }, [moveNumber]);



  const checkGameInProgress = () => {
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

  const sendChatMessage = (roomId: string, chatMessage: string) => {
    if (!socketId) {
      setLastMessage({ type: 'error', data: { message: 'Falha ao conectar com o servidor' } });
      console.log('Can\'t send chat message without a socketId');
      return;
    }

    if (!roomId) {
      setLastMessage({ type: 'error', data: { message: 'Falha ao identificar sala' } });
      console.log('Id da sala não informado ou nulo');
      return;
    }

    if (!chatMessage) return;

    const data = { roomId: roomId, chatMessage: chatMessage, playerId: socketId, }
    webSocketService.send({ type: 'sendChatMessage', data });
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

  const movePlayer = useCallback((roomId: string, keyPressed: string) => {
    if (!socketId) {
      setLastMessage({ type: 'error', data: { message: 'Falha ao conectar com o servidor' } });
      console.log('Can\'t move player without a socketId');
      return;
    }

    if (!gameState) {
      console.error('Can\'t move player without a gameState');
      return;
    }

    const newPosition = movePlayerPredict(gameState, socketId, keyPressed);
    const player = gameState.players[socketId];

    if (!player || !newPosition) {
      console.error('Can\'t move player.');
      return;
    }

    const newMoveNumber = addMoveOnHistory(newPosition.direction, newPosition.x, newPosition.y);
    console.log("movenumber no move player", newMoveNumber);


    if (newMoveNumber) {
      const data = { roomId: roomId, keyPressed: keyPressed, moveNumber: newMoveNumber + 1, playerId: socketId }
      webSocketService.send({ type: 'movePlayer', data });
    }

  }, [socketId, gameState]);

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
    /* setMoveNumber(moveNumber => moveNumber + 1);

    const newMove = {
      moveNumber: moveNumber + 1,
      direction,
      x,
      y,
    };

    console.log("movenumber do newMove", newMove);

    setMoveHistory(prevMoveHistory => [...prevMoveHistory, newMove]); */
    setMoveNumber(prevMoveNumber => {
      const newMoveNumber = prevMoveNumber + 1;
      const newMove = {
        moveNumber: newMoveNumber,
        direction,
        x,
        y,
      };


      setMoveHistory(prevMoveHistory => [...prevMoveHistory, newMove]);

      return newMoveNumber; // Atualiza moveNumber com base no valor anterior
    });

    return moveNumberRef.current;
  }

  function updateTarget(x: number, y: number, playerId?: string) {
    if (!gameState) return;

    if (playerId) {
      const player = gameState.players[playerId];

      if (!player) return;

      player.toX = x;
      player.toY = y;

    } else {
      setGameState(prevGameState => {
        if (prevGameState === null) {
          return {
            players: initialPlayersState,
            planets: initialPlanetsState,
            ball: initialBallState,
            canvas: initialCanvasState,
            room: initialRoomState,
            info: initialInfoState
          };
        }
        return {
          ...prevGameState,
          ball: {
            ...prevGameState.ball,
            toX: x,
            toY: y,
          },
        };
      });
    }
  }

  function validateAndReconcile(serverMovement: IMove) {
    if (!gameState || !socketId) {
      console.log("gameState inside", gameState);
      console.log("socketid inside", socketId);
      console.log('Can\'t validate and reconcile without a gameState or socketId');
      return;
    }
    const player = gameState.players[socketId];
    const serverMoveNumber = serverMovement.moveNumber;
    const localMove = getMoveFromSequenceNumber(serverMoveNumber);

    if (localMove) {
      if (localMove.x !== serverMovement.x || localMove.y !== serverMovement.y) {
        player.x = serverMovement.x;
        player.y = serverMovement.y;
        setIsReconciling(true);

        const movesToReapply = getAndDeleteUnacknowledgedMoves(serverMoveNumber);

        movesToReapply.forEach((move) => {
          const newPosition = movePlayerPredict(gameState, socketId, move.direction);
          if (newPosition) {
            addMoveOnHistory(move.direction, newPosition.x, newPosition.y);
          }
        });

        setIsReconciling(false);
        console.log("Reconciliation complete");
      } else {
        keepUnacknowledgedMoves(serverMoveNumber);
      }
    } else {
      player.x = serverMovement.x;
      player.y = serverMovement.y;
      keepUnacknowledgedMoves(serverMoveNumber);
    }
  }

  function getMoveFromSequenceNumber(moveNumber: number) {
    return moveHistory.find((move) => move.moveNumber === moveNumber);
  }

  function getAndDeleteUnacknowledgedMoves(fromMoveNumber: number) {
    const moves = moveHistory.filter((move) => move.moveNumber > fromMoveNumber);
    setMoveHistory([]);
    setMoveNumber(fromMoveNumber);
    return moves;
  }

  function keepUnacknowledgedMoves(fromMoveNumber: number) {
    setMoveHistory((prevMoveHistory) => {
      const newMoveHistory = prevMoveHistory.filter((move) => move.moveNumber > fromMoveNumber);
      return newMoveHistory;
    });
  }

  return (
    <WebSocketContext.Provider value={{
      socketId, webSocketService, status, gameState, roomState, rooms, lastMessage, lastChatMessage,
      getRooms, createRoom, closeRoom, joinRoom, leaveRoom, toggleReadyStatus, sendChatMessage, setLastChatMessage, removePlayer,
      movePlayer, startGame, leaveGame, setLastMessage, checkGameInProgress, setGameState, setRoomState
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