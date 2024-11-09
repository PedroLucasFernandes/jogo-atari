import { IGameMessage, IGameState, initialBallState, initialCanvasState, initialPlayersState, initialRoomState, initialPlanetsState, IPlayer } from "../interfaces/game"

export default function createGame() {

  const gameState: IGameState = {
    players: {
      'bot0': initialPlayersState[0],
      'bot1': initialPlayersState[1],
      'bot2': initialPlayersState[2],
      'bot3': initialPlayersState[3],

    },
    planets: initialPlanetsState,
    ball: initialBallState,
    canvas: initialCanvasState,
    room: initialRoomState,
  }

  const speed = 10;
  const initialY3 = 470;
  const initialX3 = 670;

  //const observers = [];

  //const observers: ((message: IGameMessage) => void)[] = [];
  const observers: Array<(message: IGameMessage) => void> = [];

  /* function subscribe(observer: () => void) {
    observers.push(observer);
  } */

  function subscribe(observerFunction: (message: IGameMessage) => void) {
    observers.push(observerFunction);
  }

  function notifyAll(message: IGameMessage) {
    for (const observerFunction of observers) {
      observerFunction(message)
    }
  }

  function setState(newState: Partial<IGameState>) {
    Object.assign(gameState, newState)
  }

  
  function movePlayer(playerId: string, keyPressed: string) {
    const player = gameState.players[playerId];
    if (!player || !keyPressed) return;

    const playerIndex = Object.keys(gameState.players).indexOf(playerId);
    if (playerIndex === -1) return;

    const speed = 10;
    
    // Função auxiliar para verificar se o player está na posição inicial
    const isAtInitialPosition = (player: IPlayer) => {
      return Math.abs(player.x - player.initialX) < speed && 
             Math.abs(player.y - player.initialY) < speed;
    };

    // Função auxiliar para verificar se o player está no limite vertical
    const isAtVerticalLimit = (player: IPlayer, isTop: boolean) => {
      return isTop ? player.y <= 0 : player.y + player.size >= gameState.canvas.height;
    };

    // Função auxiliar para verificar se o player está no limite horizontal
    const isAtHorizontalLimit = (player: IPlayer, isRight: boolean) => {
      return isRight ? player.x + player.size >= gameState.canvas.width : player.x <= 0;
    };

    const moveLogic = {
      // Player Superior Esquerdo (índice 0)
      0: {
        arrowright: (player: IPlayer) => {
          if (player.x < player.initialX) {
            // Movimento horizontal para direita até posição inicial
            player.x = Math.min(player.x + speed, player.initialX);
          } else if (!isAtVerticalLimit(player, true)) {
            // Subir depois de atingir posição inicial
            player.y = Math.max(player.y - speed, 0);
          }
        },
        arrowleft: (player: IPlayer) => {
          if (player.y === player.initialY) {
            // Movimento horizontal para esquerda
            player.x = Math.max(player.x - speed, 0);
          } else if (player.x === player.initialX) {
            // Descer de volta à posição inicial
            player.y = Math.min(player.y + speed, player.initialY);
          }
        }
      },
      // Player Superior Direito (índice 1)
      1: {
        arrowright: (player: IPlayer) => {
          if (player.y === player.initialY) {
            // Movimento horizontal para direita, considerando o tamanho do player
            player.x = Math.min(player.x + speed, gameState.canvas.width - player.size);
          } else if (player.x === player.initialX) {
            // Descer de volta à posição inicial
            player.y = Math.min(player.y + speed, player.initialY);
          }
        },
        arrowleft: (player: IPlayer) => {
          if (player.x > player.initialX) {
            // Movimento horizontal para esquerda até posição inicial
            player.x = Math.max(player.x - speed, player.initialX);
          } else if (!isAtVerticalLimit(player, true)) {
            // Subir depois de atingir posição inicial
            player.y = Math.max(player.y - speed, 0);
          }
        }
      },
      // Player Inferior Esquerdo (índice 2)
      2: {
        arrowright: (player: IPlayer) => {
          if (player.x < player.initialX) {
            // Movimento horizontal para direita até posição inicial
            player.x = Math.min(player.x + speed, player.initialX);
          } else if (!isAtVerticalLimit(player, false)) {
            // Descer depois de atingir posição inicial
            player.y = Math.min(player.y + speed, gameState.canvas.height - player.size);
          }
        },
        arrowleft: (player: IPlayer) => {
          if (player.y === player.initialY) {
            // Movimento horizontal para esquerda
            player.x = Math.max(player.x - speed, 0);
          } else if (player.x === player.initialX) {
            // Subir de volta à posição inicial
            player.y = Math.max(player.y - speed, player.initialY);
          }
        }
      },
      // Player Inferior Direito (índice 3)
      3: {
        arrowright: (player: IPlayer) => {
          if (player.y === player.initialY) {
            // Movimento horizontal para direita, considerando o tamanho do player
            player.x = Math.min(player.x + speed, gameState.canvas.width - player.size);
          } else if (player.x === player.initialX) {
            // Subir de volta à posição inicial
            player.y = Math.max(player.y - speed, player.initialY);
          }
        },
        arrowleft: (player: IPlayer) => {
          if (player.x > player.initialX) {
            // Movimento horizontal para esquerda até posição inicial
            player.x = Math.max(player.x - speed, player.initialX);
          } else if (!isAtVerticalLimit(player, false)) {
            // Descer depois de atingir posição inicial
            player.y = Math.min(player.y + speed, gameState.canvas.height - player.size);
          }
        }
      }
    };

    // Executa o movimento baseado no índice do jogador e tecla pressionada
    const playerMoveLogic = moveLogic[playerIndex as keyof typeof moveLogic];
    if (playerMoveLogic && keyPressed.toLowerCase() in playerMoveLogic) {
      playerMoveLogic[keyPressed.toLowerCase() as keyof typeof playerMoveLogic](player);
    }

    const data = {
      gameState,
    };
    notifyAll({ type: 'playerMoved', data });
  }
  // function movePlayer(playerId: string, keyPressed: string) {
  //   const player = gameState.players[playerId];
  //   if (!player || !keyPressed) return;

  //   const playerIndex = Object.keys(gameState.players).indexOf(playerId);
  //   if (playerIndex === -1) return;

  //   const speed = 10;
    
  //   // Função auxiliar para verificar se o player está na posição inicial
  //   const isAtInitialPosition = (player: IPlayer) => {
  //     return Math.abs(player.x - player.initialX) < speed && 
  //            Math.abs(player.y - player.initialY) < speed;
  //   };

  //   // Função auxiliar para verificar se o player está no limite vertical
  //   const isAtVerticalLimit = (player: IPlayer, isTop: boolean) => {
  //     return isTop ? player.y <= 0 : player.y >= gameState.canvas.height;
  //   };

  //   // Função auxiliar para verificar se o player está no limite horizontal
  //   const isAtHorizontalLimit = (player: IPlayer, isRight: boolean) => {
  //     return isRight ? player.x >= gameState.canvas.width : player.x <= 0;
  //   };

  //   const moveLogic = {
  //     // Player Superior Esquerdo (índice 0)
  //     0: {
  //       arrowright: (player: IPlayer) => {
  //         if (player.x < player.initialX) {
  //           // Movimento horizontal para direita até posição inicial
  //           player.x = Math.min(player.x + speed, player.initialX);
  //         } else if (!isAtVerticalLimit(player, true)) {
  //           // Subir depois de atingir posição inicial
  //           player.y = Math.max(player.y - speed, 0);
  //         }
  //       },
  //       arrowleft: (player: IPlayer) => {
  //         if (player.y === player.initialY) {
  //           // Movimento horizontal para esquerda
  //           player.x = Math.max(player.x - speed, 0);
  //         } else if (player.x === player.initialX) {
  //           // Descer de volta à posição inicial
  //           player.y = Math.min(player.y + speed, player.initialY);
  //         }
  //       }
  //     },
  //     // Player Superior Direito (índice 1)
  //     1: {
  //       arrowright: (player: IPlayer) => {
  //         if (player.y === player.initialY) {
  //           // Movimento horizontal para direita
  //           player.x = Math.min(player.x + speed, gameState.canvas.width);
  //         } else if (player.x === player.initialX) {
  //           // Descer de volta à posição inicial
  //           player.y = Math.min(player.y + speed, player.initialY);
  //         }
  //       },
  //       arrowleft: (player: IPlayer) => {
  //         if (player.x > player.initialX) {
  //           // Movimento horizontal para esquerda até posição inicial
  //           player.x = Math.max(player.x - speed, player.initialX);
  //         } else if (!isAtVerticalLimit(player, true)) {
  //           // Subir depois de atingir posição inicial
  //           player.y = Math.max(player.y - speed, 0);
  //         }
  //       }
  //     },
  //     // Player Inferior Esquerdo (índice 2)
  //     2: {
  //       arrowright: (player: IPlayer) => {
  //         if (player.x < player.initialX) {
  //           // Movimento horizontal para direita até posição inicial
  //           player.x = Math.min(player.x + speed, player.initialX);
  //         } else if (!isAtVerticalLimit(player, false)) {
  //           // Descer depois de atingir posição inicial
  //           player.y = Math.min(player.y + speed, gameState.canvas.height);
  //         }
  //       },
  //       arrowleft: (player: IPlayer) => {
  //         if (player.y === player.initialY) {
  //           // Movimento horizontal para esquerda
  //           player.x = Math.max(player.x - speed, 0);
  //         } else if (player.x === player.initialX) {
  //           // Subir de volta à posição inicial
  //           player.y = Math.max(player.y - speed, player.initialY);
  //         }
  //       }
  //     },
  //     // Player Inferior Direito (índice 3)
  //     3: {
  //       arrowright: (player: IPlayer) => {
  //         if (player.y === player.initialY) {
  //           // Movimento horizontal para direita
  //           player.x = Math.min(player.x + speed, gameState.canvas.width);
  //         } else if (player.x === player.initialX) {
  //           // Subir de volta à posição inicial
  //           player.y = Math.max(player.y - speed, player.initialY);
  //         }
  //       },
  //       arrowleft: (player: IPlayer) => {
  //         if (player.x > player.initialX) {
  //           // Movimento horizontal para esquerda até posição inicial
  //           player.x = Math.max(player.x - speed, player.initialX);
  //         } else if (!isAtVerticalLimit(player, false)) {
  //           // Descer depois de atingir posição inicial
  //           player.y = Math.min(player.y + speed, gameState.canvas.height);
  //         }
  //       }
  //     }
  //   };

  //   // Executa o movimento baseado no índice do jogador e tecla pressionada
  //   const playerMoveLogic = moveLogic[playerIndex as keyof typeof moveLogic];
  //   if (playerMoveLogic && keyPressed.toLowerCase() in playerMoveLogic) {
  //     playerMoveLogic[keyPressed.toLowerCase() as keyof typeof playerMoveLogic](player);
  //   }

  //   const data = {
  //     gameState,
  //   };
  //   notifyAll({ type: 'playerMoved', data });
  // }
  
  return {
    gameState,
    movePlayer,
    subscribe,
    setState
  }
}