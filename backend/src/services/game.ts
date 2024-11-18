import { IGameMessage, IGameState, initialBallState, initialCanvasState, initialPlayersState, initialRoomState, initialPlanetsState, IPlayer, IPlayerRoom, PlayersRecord, planetsByPlayersPosition, IRoomState, IPlanet, initialInfoState } from "../interfaces/game"
import * as leaderboardServices from "../services/leaderboardServices";
import webSocketService from '../index';

export default function createGame(roomState: IRoomState) {

  const gameState: IGameState = {
    players: JSON.parse(JSON.stringify(initialPlayersState)),
    planets: JSON.parse(JSON.stringify(initialPlanetsState)),
    ball: JSON.parse(JSON.stringify(initialBallState)),
    canvas: JSON.parse(JSON.stringify(initialCanvasState)),
    room: roomState,
    info: JSON.parse(JSON.stringify(initialInfoState)),
  }

  // REFACTOR, ARRUMAR COM OS VALORES DAS NOVAS POSIÇÕES DOS PLAYERS!!
  const speed = 10;
  const BASE_MAX_SPEED = 40;
  let MAX_SPEED = BASE_MAX_SPEED; // Limite de velocidade
  const BASE_SPEED = 10 // Novo valor para o INITIAL_SPEED
  let INITIAL_SPEED = BASE_SPEED; // INITIAL_SPEED agora so sofrerá incrementos conforme a dificuldade
  const ACCELERATION_FACTOR = 2.5; // Fator de aceleração ao colidir com um planeta
  const DECAY_RATE = 0.995; // Taxa de redução da velocidade após a aceleração

  const observers: Array<(message: IGameMessage) => void> = [];

  let intervalId: NodeJS.Timeout | null = null;

  function start() {
    const frequency = 1000 / 30

    setTimeout(() => {
      gameState.info.startTime = Date.now(); // Tempo de início do jogo
      intervalId = setInterval(wrappedFunctions, frequency);
    }, 3000);
  }

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



  function movePlayer(playerId: string, keyPressed: string, moveNumber: number) {
    const player = gameState.players[playerId];
    if (!player || !keyPressed) return;

    //const playerIndex = Object.keys(gameState.players).indexOf(playerId);
    //if (playerIndex === -1) return;
    const playerIndex = player.defendingPlanetId;
    //Eu ia adicionar uma propriedade de posição no player mas o defendingPlanetId já serve para isso

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
        right: (player: IPlayer) => {
          if (player.x < player.initialX) {
            // Movimento horizontal para direita até posição inicial
            player.x = Math.min(player.x + speed, player.initialX);
          } else if (!isAtVerticalLimit(player, true)) {
            // Subir depois de atingir posição inicial
            player.y = Math.max(player.y - speed, 0);
          }
        },
        left: (player: IPlayer) => {
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
        right: (player: IPlayer) => {
          if (player.y === player.initialY) {
            // Movimento horizontal para direita, considerando o tamanho do player
            player.x = Math.min(player.x + speed, gameState.canvas.width - player.size);
          } else if (player.x === player.initialX) {
            // Descer de volta à posição inicial
            player.y = Math.min(player.y + speed, player.initialY);
          }
        },
        left: (player: IPlayer) => {
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
        right: (player: IPlayer) => {
          if (player.x < player.initialX) {
            // Movimento horizontal para direita até posição inicial
            player.x = Math.min(player.x + speed, player.initialX);
          } else if (!isAtVerticalLimit(player, false)) {
            // Descer depois de atingir posição inicial
            player.y = Math.min(player.y + speed, gameState.canvas.height - player.size);
          }
        },
        left: (player: IPlayer) => {
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
        right: (player: IPlayer) => {
          if (player.y === player.initialY) {
            // Movimento horizontal para direita, considerando o tamanho do player
            player.x = Math.min(player.x + speed, gameState.canvas.width - player.size);
          } else if (player.x === player.initialX) {
            // Subir de volta à posição inicial
            player.y = Math.max(player.y - speed, player.initialY);
          }
        },
        left: (player: IPlayer) => {
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

    // Mapeamento de diferente teclas para um padrão fixo
    const keyMap: { [key: string]: string } = {
      arrowleft: 'left',
      arrowright: 'right',
      a: 'left',
      d: 'right'
    };

    // Executa o movimento baseado no índice do jogador e tecla pressionada
    const playerMoveLogic = moveLogic[playerIndex as keyof typeof moveLogic];
    const direction = keyMap[keyPressed.toLowerCase()];

    if (playerMoveLogic && direction in playerMoveLogic) {
      playerMoveLogic[direction as keyof typeof playerMoveLogic](player);
    }

    const data = {
      //gameState,
      move: { direction: keyPressed, x: player.x, y: player.y, moveNumber },
      playerId
    };
    notifyAll({ type: 'playerMoved', data });
  }

  function notifyBallUpdate() {
    /* const data = {
      ball: gameState.ball,
    }; */
    const data = {
      position: { x: gameState.ball.x, y: gameState.ball.y }
    }

    notifyAll({ type: 'updateBall', data });
  }

  function notifyPlayerActiveUpdate(playerId: string) {
    const data = {
      playerId: playerId,
      playerActive: gameState.players[playerId].active
    }
    notifyAll({ type: 'updatePlayerActive', data });
  }

  function notifyPlanetUpdate() {
    const data = {
      planets: gameState.planets,
      planetDestruction: true,
    };

    // Enviar notificação inicial se todas as partes do planeta ainda estiverem ativas
    for (const planet of gameState.planets) {
      if (planet.active && planet.parts.every(part => part)) {
        notifyAll({ type: 'updatePlanet', data });
        break; // Notificar apenas uma vez
      }
    }
    notifyAll({ type: 'updatePlanet', data });
  }

  function checkIfPlanetIsDefeated(planet: IPlanet) {
    return planet.parts.every(part => !part);
  }


  function moveBall() {
    //console.log("bola", gameState.ball.speedX, gameState.ball.speedY);
    let collisionDetected = false;

    // Armazena a posição anterior da bola
    const previousX = gameState.ball.x;
    const previousY = gameState.ball.y;

    // Atualiza a posição da bola
    gameState.ball.x += gameState.ball.speedX;
    gameState.ball.y += gameState.ball.speedY;

    // Função auxiliar para resolver colisões
    const resolveCollision = () => {
      // Retorna a bola para a posição anterior à colisão
      gameState.ball.x = previousX;
      gameState.ball.y = previousY;

      // Adiciona um pequeno deslocamento na direção oposta à colisão
      const pushBackDistance = 1;
      if (Math.abs(gameState.ball.speedX) > Math.abs(gameState.ball.speedY)) {
        gameState.ball.x += gameState.ball.speedX > 0 ? -pushBackDistance : pushBackDistance;
      } else {
        gameState.ball.y += gameState.ball.speedY > 0 ? -pushBackDistance : pushBackDistance;
      }
    };

    // Verifica colisão com as bordas do canvas
    const handleWallCollision = () => {
      let hasCollision = false;

      if (gameState.ball.x <= 0 || gameState.ball.x + gameState.ball.radius >= gameState.canvas.width) {
        gameState.ball.speedX *= -1;

        // Adiciona variação controlada à velocidade
        const maxVariation = 0.3;
        const randomVariation = (Math.random() - 0.5) * maxVariation;
        gameState.ball.speedX += randomVariation;

        hasCollision = true;
      }

      if (gameState.ball.y <= 0 || gameState.ball.y + gameState.ball.radius >= gameState.canvas.height) {
        gameState.ball.speedY *= -1;

        // Adiciona variação controlada à velocidade
        const maxVariation = 0.3;
        const randomVariation = (Math.random() - 0.5) * maxVariation;
        gameState.ball.speedY += randomVariation;

        hasCollision = true;
      }

      if (hasCollision) {
        resolveCollision();
      }
    };

    // Verifica colisão com jogadores
    const handlePlayerCollision = () => {
      for (const playerId in gameState.players) {
        const player = gameState.players[playerId];

        // Ignore jogadores inativos
        if (!player.active) continue;

        // Calcula os limites da bola e do jogador
        const ballLeft = gameState.ball.x - gameState.ball.radius;
        const ballRight = gameState.ball.x + gameState.ball.radius;
        const ballTop = gameState.ball.y - gameState.ball.radius;
        const ballBottom = gameState.ball.y + gameState.ball.radius;

        const playerLeft = player.x;
        const playerRight = player.x + player.size;
        const playerTop = player.y;
        const playerBottom = player.y + player.size;

        if (
          ballRight > playerLeft &&
          ballLeft < playerRight &&
          ballBottom > playerTop &&
          ballTop < playerBottom
        ) {
          // Determina a direção da colisão
          const overlapLeft = ballRight - playerLeft;
          const overlapRight = playerRight - ballLeft;
          const overlapTop = ballBottom - playerTop;
          const overlapBottom = playerBottom - ballTop;

          // Encontra a menor sobreposição para determinar a direção da colisão
          const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

          // Aplica a resposta à colisão baseada na direção
          if (minOverlap === overlapLeft || minOverlap === overlapRight) {
            gameState.ball.speedX *= -1;
          } else {
            gameState.ball.speedY *= -1;
          }

          // Adiciona variação controlada à velocidade
          const maxVariation = 0.5;
          const randomVariationX = (Math.random() - 0.5) * maxVariation;
          const randomVariationY = (Math.random() - 0.5) * maxVariation;

          gameState.ball.speedX += randomVariationX;
          gameState.ball.speedY += randomVariationY;

          // Afastar a bola para evitar que ela fique presa
          pushBallOut(player);

          resolveCollision();
          break;
        }
      }
    };

    // Função para afastar a bola após a colisão
    const pushBallOut = (player: IPlayer) => {
      const pushBackDistance = 2; // Ajuste a distância conforme necessário
      // Empurra a bola para fora da área do jogador na direção correta
      if (gameState.ball.x < player.x) {
        gameState.ball.x -= pushBackDistance;
      } else if (gameState.ball.x > player.x + player.size) {
        gameState.ball.x += pushBackDistance;
      }

      if (gameState.ball.y < player.y) {
        gameState.ball.y -= pushBackDistance;
      } else if (gameState.ball.y > player.y + player.size) {
        gameState.ball.y += pushBackDistance;
      }
    };

    // Aplica limite máximo à velocidade
    const clampSpeed = () => {
      //const MAX_SPEED = 20;
      gameState.ball.speedX = Math.min(Math.max(gameState.ball.speedX, -MAX_SPEED), MAX_SPEED);
      gameState.ball.speedY = Math.min(Math.max(gameState.ball.speedY, -MAX_SPEED), MAX_SPEED);
    };

    // Executa as verificações de colisão
    handleWallCollision();
    handlePlayerCollision();


    for (const planet of gameState.planets) {
      if (planet.active) {
        // notifyPlanetUpdate();
        const partWidth = planet.width / 2;
        const partHeight = planet.height / 3;

        for (let i = 0; i < planet.parts.length; i++) {
          if (planet.parts[i]) {
            const partX = planet.x + (i % 2) * partWidth;
            const partY = planet.y + Math.floor(i / 2) * partHeight;

            if (
              gameState.ball.x + gameState.ball.radius > partX &&
              gameState.ball.x - gameState.ball.radius < partX + partWidth &&
              gameState.ball.y + gameState.ball.radius > partY &&
              gameState.ball.y - gameState.ball.radius < partY + partHeight
            ) {

              planet.parts[i] = false;
              // gameState.ball.speedX *= -1;
              // gameState.ball.speedY *= -1;
              gameState.ball.speedX *= -ACCELERATION_FACTOR;
              gameState.ball.speedY *= -ACCELERATION_FACTOR;

              collisionDetected = true;

              // Verificar se o planeta foi totalmente destruído
              if (checkIfPlanetIsDefeated(planet)) {
                console.log("Chegou aqui no checagem do planeta totalmente destruído")
                // Desativa o jogador, se houver um dono associado ao planeta
                console.log("Estado do player antes do planeta ser todo destruído")
                console.log(gameState.players[planet.ownerId].active)

                if (planet.ownerId) {
                  const playerId = planet.ownerId;
                  if (gameState.players[playerId]) {
                    gameState.players[playerId].active = false; // Marca o jogador como inativo
                    console.log("Estado do player depois do planeta ser todo destruído")
                    console.log(gameState.players[playerId].active)
                    notifyPlayerActiveUpdate(playerId)
                  }
                }
              }

              break;
            }
          }
        }
      }
    }

    clampSpeed();


    if (collisionDetected) {
      notifyPlanetUpdate();
    }

    // Desaceleração controlada até a velocidade inicial
    if (Math.abs(gameState.ball.speedX) > Math.abs(INITIAL_SPEED)) {
      gameState.ball.speedX *= DECAY_RATE;
      if (Math.abs(gameState.ball.speedX) < Math.abs(INITIAL_SPEED)) {
        gameState.ball.speedX = INITIAL_SPEED * Math.sign(gameState.ball.speedX);
      }
    }

    if (Math.abs(gameState.ball.speedY) > Math.abs(INITIAL_SPEED)) {
      gameState.ball.speedY *= DECAY_RATE;
      if (Math.abs(gameState.ball.speedY) < Math.abs(INITIAL_SPEED)) {
        gameState.ball.speedY = INITIAL_SPEED * Math.sign(gameState.ball.speedY);
      }
    }

    notifyBallUpdate();
    // Chama a função para verificar se há um vencedor
    checkForWinner();
  }


  // function moveBall() {
  //   let collisionDetected = false;

  //   // Armazena a posição anterior da bola
  //   const previousX = gameState.ball.x;
  //   const previousY = gameState.ball.y;

  //   // Atualiza a posição da bola
  //   gameState.ball.x += gameState.ball.speedX;
  //   gameState.ball.y += gameState.ball.speedY;

  //   // Função auxiliar para resolver colisões
  //   const resolveCollision = () => {
  //     // Retorna a bola para a posição anterior à colisão
  //     gameState.ball.x = previousX;
  //     gameState.ball.y = previousY;

  //     // Adiciona um pequeno deslocamento na direção oposta à colisão
  //     const pushBackDistance = 1;
  //     if (Math.abs(gameState.ball.speedX) > Math.abs(gameState.ball.speedY)) {
  //       gameState.ball.x += gameState.ball.speedX > 0 ? -pushBackDistance : pushBackDistance;
  //     } else {
  //       gameState.ball.y += gameState.ball.speedY > 0 ? -pushBackDistance : pushBackDistance;
  //     }
  //   };

  //   // Verifica colisão com as bordas do canvas
  //   const handleWallCollision = () => {
  //     let hasCollision = false;

  //     if (gameState.ball.x <= 0 || gameState.ball.x + gameState.ball.radius >= gameState.canvas.width) {
  //       gameState.ball.speedX *= -1;

  //       // Adiciona variação controlada à velocidade
  //       const maxVariation = 0.3;
  //       const randomVariation = (Math.random() - 0.5) * maxVariation;
  //       gameState.ball.speedX += randomVariation;

  //       hasCollision = true;
  //     }

  //     if (gameState.ball.y <= 0 || gameState.ball.y + gameState.ball.radius >= gameState.canvas.height) {
  //       gameState.ball.speedY *= -1;

  //       // Adiciona variação controlada à velocidade
  //       const maxVariation = 0.3;
  //       const randomVariation = (Math.random() - 0.5) * maxVariation;
  //       gameState.ball.speedY += randomVariation;

  //       hasCollision = true;
  //     }

  //     if (hasCollision) {
  //       resolveCollision();
  //     }
  //   };

  //   // Verifica colisão com jogadores
  //   const handlePlayerCollision = () => {
  //     for (const playerId in gameState.players) {
  //       const player = gameState.players[playerId];

  //       // Calcula os limites da bola e do jogador
  //       const ballLeft = gameState.ball.x - gameState.ball.radius;
  //       const ballRight = gameState.ball.x + gameState.ball.radius;
  //       const ballTop = gameState.ball.y - gameState.ball.radius;
  //       const ballBottom = gameState.ball.y + gameState.ball.radius;

  //       const playerLeft = player.x;
  //       const playerRight = player.x + player.size;
  //       const playerTop = player.y;
  //       const playerBottom = player.y + player.size;

  //       if (
  //         ballRight > playerLeft &&
  //         ballLeft < playerRight &&
  //         ballBottom > playerTop &&
  //         ballTop < playerBottom
  //       ) {
  //         // Determina a direção da colisão
  //         const overlapLeft = ballRight - playerLeft;
  //         const overlapRight = playerRight - ballLeft;
  //         const overlapTop = ballBottom - playerTop;
  //         const overlapBottom = playerBottom - ballTop;

  //         // Encontra a menor sobreposição para determinar a direção da colisão
  //         const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

  //         // Aplica a resposta à colisão baseada na direção
  //         if (minOverlap === overlapLeft || minOverlap === overlapRight) {
  //           gameState.ball.speedX *= -1;
  //         } else {
  //           gameState.ball.speedY *= -1;
  //         }

  //         // Adiciona variação controlada à velocidade
  //         const maxVariation = 0.5;
  //         const randomVariationX = (Math.random() - 0.5) * maxVariation;
  //         const randomVariationY = (Math.random() - 0.5) * maxVariation;

  //         gameState.ball.speedX += randomVariationX;
  //         gameState.ball.speedY += randomVariationY;

  //         // Afastar a bola para evitar que ela fique presa
  //         pushBallOut(player);

  //         resolveCollision();
  //         break;
  //       }
  //     }
  //   };

  //   // Função para afastar a bola após a colisão
  //   const pushBallOut = (player: IPlayer) => {
  //     const pushBackDistance = 2; // Ajuste a distância conforme necessário
  //     // Empurra a bola para fora da área do jogador na direção correta
  //     if (gameState.ball.x < player.x) {
  //       gameState.ball.x -= pushBackDistance;
  //     } else if (gameState.ball.x > player.x + player.size) {
  //       gameState.ball.x += pushBackDistance;
  //     }

  //     if (gameState.ball.y < player.y) {
  //       gameState.ball.y -= pushBackDistance;
  //     } else if (gameState.ball.y > player.y + player.size) {
  //       gameState.ball.y += pushBackDistance;
  //     }
  //   };

  //   // Aplica limite máximo à velocidade
  //   const clampSpeed = () => {
  //     //const MAX_SPEED = 20;
  //     gameState.ball.speedX = Math.min(Math.max(gameState.ball.speedX, -MAX_SPEED), MAX_SPEED);
  //     gameState.ball.speedY = Math.min(Math.max(gameState.ball.speedY, -MAX_SPEED), MAX_SPEED);
  //   };

  //   // Executa as verificações de colisão
  //   handleWallCollision();
  //   handlePlayerCollision();


  //   for (const planet of gameState.planets) {
  //     if (planet.active) {
  //       // notifyPlanetUpdate();
  //       const partWidth = planet.width / 2;
  //       const partHeight = planet.height / 3;

  //       for (let i = 0; i < planet.parts.length; i++) {
  //         if (planet.parts[i]) {
  //           const partX = planet.x + (i % 2) * partWidth;
  //           const partY = planet.y + Math.floor(i / 2) * partHeight;

  //           if (
  //             gameState.ball.x + gameState.ball.radius > partX &&
  //             gameState.ball.x - gameState.ball.radius < partX + partWidth &&
  //             gameState.ball.y + gameState.ball.radius > partY &&
  //             gameState.ball.y - gameState.ball.radius < partY + partHeight
  //           ) {

  //             planet.parts[i] = false;
  //             // gameState.ball.speedX *= -1;
  //             // gameState.ball.speedY *= -1;
  //             gameState.ball.speedX *= -ACCELERATION_FACTOR;
  //             gameState.ball.speedY *= -ACCELERATION_FACTOR;

  //             collisionDetected = true;
  //             break;
  //           }
  //         }
  //       }
  //     }
  //   }

  //   clampSpeed();


  //   if (collisionDetected) {
  //     notifyPlanetUpdate();
  //   }

  //   // Desaceleração controlada até a velocidade inicial
  //   if (Math.abs(gameState.ball.speedX) > Math.abs(INITIAL_SPEED)) {
  //     gameState.ball.speedX *= DECAY_RATE;
  //     if (Math.abs(gameState.ball.speedX) < Math.abs(INITIAL_SPEED)) {
  //       gameState.ball.speedX = INITIAL_SPEED * Math.sign(gameState.ball.speedX);
  //     }
  //   }

  //   if (Math.abs(gameState.ball.speedY) > Math.abs(INITIAL_SPEED)) {
  //     gameState.ball.speedY *= DECAY_RATE;
  //     if (Math.abs(gameState.ball.speedY) < Math.abs(INITIAL_SPEED)) {
  //       gameState.ball.speedY = INITIAL_SPEED * Math.sign(gameState.ball.speedY);
  //     }
  //   }

  //   notifyBallUpdate();
  //   // Chama a função para verificar se há um vencedor
  //   checkForWinner();
  // }


  function addPlayers(players: IPlayerRoom[]) {
    // Limpa os jogadores e planetas no gameState
    gameState.players = {};
    gameState.planets = [];

    // Embaralha `planetsByPlayersPosition` para distribuir posições aleatórias
    const shuffledPositions = [...planetsByPlayersPosition].sort(() => Math.random() - 0.5);

    // Associa jogadores aleatoriamente às posições e planetas correspondentes
    players.forEach((player, index) => {
      const position = shuffledPositions[index]; // Posição aleatória para o jogador

      if (position) {  // Garante que a posição existe
        // Define as informações do jogador no estado do jogo
        gameState.players[player.playerId] = {
          username: player.username,
          x: position.player.x,
          y: position.player.y,
          toX: position.player.x,
          toY: position.player.y,
          initialX: position.player.x,
          initialY: position.player.y,
          size: 80,
          isBot: false,
          imageSrc: '',
          defendingPlanetId: position.defendingPlanetId!, // Usa a non-null assertion
          active: true,
        };

        // Adiciona o planeta correspondente ao jogador no estado do jogo
        gameState.planets.push({
          x: initialPlanetsState[position.defendingPlanetId!].x,
          y: initialPlanetsState[position.defendingPlanetId!].y,
          width: initialPlanetsState[position.defendingPlanetId!].width,
          height: initialPlanetsState[position.defendingPlanetId!].height,
          active: initialPlanetsState[position.defendingPlanetId!].active,
          parts: [...initialPlanetsState[position.defendingPlanetId!].parts], // cópia do array `parts`
          imageSrc: initialPlanetsState[position.defendingPlanetId!].imageSrc,
          ownerId: player.playerId,
        });
      }
    });
  }


  function extractUserId(socketId: string): string {
    // Divide a string pelos underscores e pega o segundo elemento (índice 1)
    return socketId.split('_')[1];
  }

  async function checkForWinner() {
    const activePlanets = gameState.planets.filter(planet => planet.active);

    // Verifica se há apenas um planeta ativo com partes restantes
    const remainingPlayers = activePlanets.filter(planet =>
      planet.parts.some(part => part)
    );

    if (remainingPlayers.length === 1) {
      const winningPlanet = remainingPlayers[0];
      const winnerPlayerId = winningPlanet.ownerId;
      const realUserId = extractUserId(winningPlanet.ownerId);
      const winnerPlayerName = gameState.players[winnerPlayerId]?.username || 'um alien invasor que não se identificou!';

      stop();

      // Notifica todos os observadores sobre o vencedor
      notifyAll({
        type: 'gameOver',
        data: {
          winner: {
            username: winnerPlayerName,
            id: realUserId
          }
        }
      });

      // Para o jogo após encontrar um vencedor
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }


      try {
        // Primeiro, cria um array de promessas
        const promises = [];

        // Atualiza o leaderboard com a vitória
        promises.push(leaderboardServices.saveOrUpdateUserLeaderboardData(realUserId, "total_score"));

        // Atualiza o leaderboard para todos os outros jogadores (perdedores)
        const allPlanets = gameState.planets; // Usa todos os planetas do jogo

        for (const planet of allPlanets) {
          // Ignora o planeta do vencedor ou planetas sem um ownerId válido
          if (planet.ownerId === winnerPlayerId || !planet.ownerId) continue;

          // Verifica se o ownerId é válido antes de atualizar o leaderboard
          const loserUserId = extractUserId(planet.ownerId);
          if (!loserUserId) continue; // Ignora caso o userId não seja válido

          promises.push(leaderboardServices.saveOrUpdateUserLeaderboardData(loserUserId, "total_games_played"));
        }

        // Aguarda todas as promessas serem resolvidas antes de continuar
        await Promise.all(promises);

        console.log(`Player ${winnerPlayerName} venceu o jogo!`);

        // Limpando sala e sessão do jogo
        webSocketService.clearGameSession(gameState.room.roomId);


      } catch (error) {
        console.error(`Erro ao atualizar leaderboard para o jogador ${winnerPlayerName}:`, error);
      }
    }
  }

  function stop() {
    // Interrompe o intervalo se ele estiver ativo
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null; // Reseta a variável para indicar que o intervalo foi interrompido
    }
  }

  let lastSentElapsedSeconds = 0;

  // Notifica o tempo da partida a cada segundo
  function updateInfo() {
    const serverStartTime = gameState.info.startTime;
    const currentTime = Date.now();
    const elapsedTime = Math.floor((currentTime - serverStartTime) / 1000);

    gameState.info.elapsedSeconds = elapsedTime;

    if (elapsedTime !== lastSentElapsedSeconds) {
      lastSentElapsedSeconds = elapsedTime;

      updateDifficulty();

      notifyAll({
        type: 'infoUpdated',
        data: {
          info: gameState.info
        }
      });
    }
  }

  // Incrementa a dificuldade a cada 30 segundos
  function updateDifficulty() {
    const elapsedSeconds = gameState.info.elapsedSeconds;
    //if (elapsedSeconds < 30) return;
    const difficultyLevel = Math.floor(elapsedSeconds / 30 + 1);

    gameState.info.difficulty = difficultyLevel;

    //Modifica a velocidade da bola
    INITIAL_SPEED = BASE_SPEED + (difficultyLevel - 1) * 3; //Incrementa de 2 em 2 com base na dificuldade
    MAX_SPEED = BASE_MAX_SPEED + (difficultyLevel - 1) * 3;
    //gameState.ball.speedX = INITIAL_SPEED;
    //gameState.ball.speedY = INITIAL_SPEED;
    console.log(INITIAL_SPEED);
    console.log(gameState.ball.speedX);
    console.log(gameState.ball.speedY);
  }

  function wrappedFunctions() {
    updateInfo();
    moveBall();
  }

  return {
    gameState,
    movePlayer,
    subscribe,
    setState,
    start,
    addPlayers,
    stop
  }
}