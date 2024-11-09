import { AcceptedMoves, IGameMessage, IGameState, initialBallState, initialCanvasState, initialPlayersState, initialRoomState, initialPlanetsState, IPlayer, IPlayerRoom, PlayersRecord } from "../interfaces/game"
import * as leaderboardServices from "../services/leaderboardServices";


export default function createGame() {



  const gameState: IGameState = {
    players: initialPlayersState,
    planets: initialPlanetsState,
    ball: initialBallState,
    canvas: initialCanvasState,
    room: initialRoomState
  }

  // REFACTOR, ARRUMAR COM OS VALORES DAS NOVAS POSIÇÕES DOS PLAYERS!!
  const speed = 10;
  const MAX_SPEED = 10; // Limite de velocidade
  const initialPositions = [
    { x: 170, y: 150 },
    { x: 550, y: 150 },
    { x: 170, y: 370 },
    { x: 550, y: 370 },
  ];

  const observers: Array<(message: IGameMessage) => void> = [];

  let intervalId: NodeJS.Timeout | null = null;

  function start() {
    const frequency = 1000 / 60

    intervalId = setInterval(moveBall, frequency);
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

  function movePlayer(playerId: string, keyPressed: string) {
    const player = gameState.players[playerId];
    if (!player || !keyPressed) return;

    const playerIndex = Object.keys(gameState.players).indexOf(playerId);
    if (playerIndex === -1) return;
    const toleranceX = speed;
    const toleranceY = speed;
    const acceptedMoves: Record<AcceptedMoves, (player: IPlayer, index: number) => void> = {


      w(player: IPlayer, index: number) {
        if (index === 0 || index === 1) {
          if (player.y > 0) {
            // Verifica se o jogador está dentro da zona de tolerância no eixo X
            if (Math.abs(player.x - player.initialX) <= toleranceX) {
              player.x = player.initialX; // Corrige a posição no eixo X
              player.y = Math.max(player.y - speed, 0);
            }
          }
        } else {
          if (player.y > player.initialY) {
            if (Math.abs(player.x - player.initialX) <= toleranceX) {
              player.x = player.initialX;
              player.y = Math.max(player.y - speed, player.initialY);
            }
          }
        }
      },
      a(player: IPlayer, index: number) {
        if (index === 0 || index === 2) {
          if (player.x > 0) {
            if (Math.abs(player.y - player.initialY) <= toleranceY) {
              player.y = player.initialY;
              player.x = Math.max(player.x - speed, 0);
            }
          }
        } else {
          if (player.x > player.initialX) {
            if (Math.abs(player.y - player.initialY) <= toleranceY) {
              player.y = player.initialY;
              player.x = Math.max(player.x - speed, player.initialX);
            }
          }
        }
      },
      s(player: IPlayer, index: number) {
        if (index === 0 || index === 1) {
          if (player.y < player.initialY) {
            if (Math.abs(player.x - player.initialX) <= toleranceX) {
              player.x = player.initialX;
              player.y = Math.min(player.y + speed, player.initialY);
            }
          }
        } else {
          if (player.y < gameState.canvas.height) {
            if (Math.abs(player.x - player.initialX) <= toleranceX) {
              player.x = player.initialX;
              player.y = Math.min(player.y + speed, gameState.canvas.height);
            }
          }
        }
      },
      d(player: IPlayer, index: number) {
        if (index === 1 || index === 3) {
          if (player.x < gameState.canvas.width) {
            if (Math.abs(player.y - player.initialY) <= toleranceY) {
              player.y = player.initialY;
              player.x = Math.min(player.x + speed, gameState.canvas.width);
            }
          }
        } else {
          if (player.x < player.initialX) {
            if (Math.abs(player.y - player.initialY) <= toleranceY) {
              player.y = player.initialY;
              player.x = Math.min(player.x + speed, player.initialX);
            }
          }
        }
      },
      arrowup(player: IPlayer, index: number) {
        if (index === 0 || index === 1) {
          if (player.y > 0) {
            // Verifica se o jogador está dentro da zona de tolerância no eixo X
            if (Math.abs(player.x - player.initialX) <= toleranceX) {
              player.x = player.initialX; // Corrige a posição no eixo X
              player.y = Math.max(player.y - speed, 0);
            }
          }
        } else {
          if (player.y > player.initialY) {
            if (Math.abs(player.x - player.initialX) <= toleranceX) {
              player.x = player.initialX;
              player.y = Math.max(player.y - speed, player.initialY);
            }
          }
        }
      },
      arrowleft(player: IPlayer, index: number) {
        if (index === 0 || index === 2) {
          if (player.x > 0) {
            if (Math.abs(player.y - player.initialY) <= toleranceY) {
              player.y = player.initialY;
              player.x = Math.max(player.x - speed, 0);
            }
          }
        } else {
          if (player.x > player.initialX) {
            if (Math.abs(player.y - player.initialY) <= toleranceY) {
              player.y = player.initialY;
              player.x = Math.max(player.x - speed, player.initialX);
            }
          }
        }
      },
      arrowdown(player: IPlayer, index: number) {
        if (index === 0 || index === 1) {
          if (player.y < player.initialY) {
            if (Math.abs(player.x - player.initialX) <= toleranceX) {
              player.x = player.initialX;
              player.y = Math.min(player.y + speed, player.initialY);
            }
          }
        } else {
          if (player.y < gameState.canvas.height) {
            if (Math.abs(player.x - player.initialX) <= toleranceX) {
              player.x = player.initialX;
              player.y = Math.min(player.y + speed, gameState.canvas.height);
            }
          }
        }
      },
      arrowright(player: IPlayer, index: number) {
        if (index === 1 || index === 3) {
          if (player.x < gameState.canvas.width) {
            if (Math.abs(player.y - player.initialY) <= toleranceY) {
              player.y = player.initialY;
              player.x = Math.min(player.x + speed, gameState.canvas.width);
            }
          }
        } else {
          if (player.x < player.initialX) {
            if (Math.abs(player.y - player.initialY) <= toleranceY) {
              player.y = player.initialY;
              player.x = Math.min(player.x + speed, player.initialX);
            }
          }
        }
      },
    };

    // Executa o movimento com base na tecla pressionada
    if (keyPressed in acceptedMoves) {
      const moveFunction = acceptedMoves[keyPressed as AcceptedMoves];
      moveFunction(player, playerIndex);
    }

    const data = {
      gameState,
    };
    notifyAll({ type: 'playerMoved', data });
  }

  function notifyBallUpdate() {
    const data = {
      ball: gameState.ball,
    };

    notifyAll({ type: 'updateBall', data });
  }

  // function notifyPlanetUpdate() {
  //   const data = {
  //     planets: gameState.planets,
  //   };
  //   notifyAll({ type: 'updatePlanet', data });
  // }

  function notifyPlanetUpdate(isInitial: boolean = false) {
    const data = {
      planets: gameState.planets,
    };

    // Enviar notificação inicial se todas as partes do planeta ainda estiverem ativas
    if (isInitial) {
      for (const planet of gameState.planets) {
        if (planet.active && planet.parts.every(part => part)) {
          notifyAll({ type: 'updatePlanet', data });
          break; // Notificar apenas uma vez
        }
      }
    } else {
      // Notificar após colisões
      notifyAll({ type: 'updatePlanet', data });
    }
  }

  function moveBall() {
    let collisionDetected = false;

    // Atualiza a posição da bola
    gameState.ball.x += gameState.ball.speedX;
    gameState.ball.y += gameState.ball.speedY;

    // Verifica colisão com as bordas do canvas
    if (gameState.ball.x <= 0 || gameState.ball.x + gameState.ball.radius >= gameState.canvas.width) {
      // Inverte a direção no eixo X ao colidir com as bordas esquerda ou direita
      gameState.ball.speedX *= -1;

      // Adiciona uma variação leve à velocidade X para evitar trajetórias muito previsíveis
      const randomVariation = (Math.random() - 0.5) * 0.5; // Variação entre -0.25 e 0.25 (ajuste conforme necessário)
      gameState.ball.speedX += randomVariation;
    }

    if (gameState.ball.y <= 0 || gameState.ball.y + gameState.ball.radius >= gameState.canvas.height) {
      // Inverte a direção no eixo Y ao colidir com as bordas superior ou inferior
      gameState.ball.speedY *= -1;

      // Adiciona uma variação leve à direção Y para evitar trajetórias muito previsíveis
      const randomAngle = (Math.random() - 0.5) * 0.3; // Variação entre -0.15 e 0.15 (ajuste conforme necessário)
      gameState.ball.speedY += randomAngle;
    }


    // Verifica colisão da bola com cada jogador
    for (const playerId in gameState.players) {
      const player = gameState.players[playerId];

      // Ajuste conforme necessário
      if (
        gameState.ball.x + gameState.ball.radius > player.x &&
        gameState.ball.x - gameState.ball.radius < player.x + player.size &&
        gameState.ball.y + gameState.ball.radius > player.y &&
        gameState.ball.y - gameState.ball.radius < player.y + player.size
      ) {
        // Rebater a bola ao detectar colisão
        gameState.ball.speedX *= -1; // Inverte a direção no eixo X

        // Adiciona uma variação aleatória à direção Y
        const randomAngle = (Math.random() - 0.5) * 0.3; // Variação entre -0.15 e 0.15 (ajuste conforme necessário)
        gameState.ball.speedY = gameState.ball.speedY * -1 + randomAngle; // Inverte Y e adiciona variação

        // Adiciona uma variação leve à velocidade X para evitar trajetórias muito previsíveis
        const randomVariation = (Math.random() - 0.5) * 2; // Variação entre -1 e 1 (ajuste conforme necessário)
        gameState.ball.speedX += randomVariation;

        break; // Sai do loop após detectar a colisão com um jogador
      }
    }

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
              gameState.ball.speedX *= -1;
              gameState.ball.speedY *= -1;


              collisionDetected = true;
              break;
            }
          }
        }
      }
    }

    gameState.ball.speedX = Math.min(Math.max(gameState.ball.speedX, -MAX_SPEED), MAX_SPEED);
    gameState.ball.speedY = Math.min(Math.max(gameState.ball.speedY, -MAX_SPEED), MAX_SPEED);

    if (collisionDetected) {
      notifyPlanetUpdate();
    }

    notifyBallUpdate();
    // Chama a função para verificar se há um vencedor
    checkForWinner();
  }


  function addPlayers(players: IPlayerRoom[]) {
    const positions = [
      { x: 170, y: 150 },
      { x: 550, y: 150 },
      { x: 150, y: 370 },
      { x: 550, y: 370 },
    ];

    // Limpa todos os jogadores atuais de gameState.players
    gameState.players = {};

    // Embaralha as posições para alocar jogadores aleatoriamente
    const shuffledPlayers = [...players];
    shuffledPlayers.sort(() => Math.random() - 0.5);

    // Preenche as posições com os jogadores reais (primeiras posições da lista)
    shuffledPlayers.forEach((player, index) => {
      const { x, y } = positions[index]; // Usa as posições fixas

      gameState.players[player.playerId] = {
        username: player.username,
        x,
        y,
        initialX: x,
        initialY: y,
        size: 80,
        isBot: false,
        imageSrc: "",
        defendingPlanetId: index,
      };
      const planet = initialPlanetsState[index];
      planet.ownerId = player.playerId;

    });



    // Quantidade total de jogadores (real + bots)
    const totalPlayers = 4;

    // Adiciona bots nas posições restantes
    const botEntries = Object.entries(initialPlayersState);
    const remainingBots = totalPlayers - players.length;

    for (let i = 0; i < remainingBots; i++) {
      const botId = botEntries[i][0];
      const botData = botEntries[i][1];
      const positionIndex = players.length + i;

      const { x, y } = positions[positionIndex]; // Usa as posições fixas para bots também

      gameState.players[botId] = {
        ...botData,
        x,
        y,
        initialX: x,
        initialY: y,
        defendingPlanetId: positionIndex,
      };
      // Associa o bot ao planeta
      const planet = initialPlanetsState[positionIndex];
      planet.ownerId = botId;
    }
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
      const winnerPlayerName = gameState.players[winnerPlayerId]?.username || 'Unknown Player';

      console.log("userId do vencedor", realUserId)

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
        // Atualiza o leaderboard com a vitória
        await leaderboardServices.saveOrUpdateUserLeaderboardData(realUserId, "total_score");

        // Atualiza o leaderboard para todos os outros jogadores (perdedores)
        const allPlanets = gameState.planets; // Usa todos os planetas do jogo

        for (const planet of allPlanets) {
          // Ignora o planeta do vencedor ou planetas sem um ownerId válido
          if (planet.ownerId === winnerPlayerId || !planet.ownerId) continue;

          // Verifica se o ownerId é válido antes de atualizar o leaderboard
          const loserUserId = extractUserId(planet.ownerId);
          if (!loserUserId) continue; // Ignora caso o userId não seja válido

          await leaderboardServices.saveOrUpdateUserLeaderboardData(loserUserId, "total_games_played");
        }

        console.log(`Player ${winnerPlayerName} venceu o jogo!`);

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