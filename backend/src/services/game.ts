import { AcceptedMoves, IGameMessage, IGameState, initialBallState, initialCanvasState, initialPlayersState, initialRoomState, initialWallsState, IPlayer, IPlayerRoom, PlayersRecord } from "../interfaces/game"

export default function createGame() {

  const gameState: IGameState = {
    players: initialPlayersState,
    walls: initialWallsState,
    ball: initialBallState,
    canvas: initialCanvasState,
    room: initialRoomState
  }

  const speed = 10;
  const initialPositions = [
    { x: 150, y: 150 },
    { x: 630, y: 150 },
    { x: 150, y: 430 },
    { x: 630, y: 430 },
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

  // function movePlayer(message: IGameMessage) {

  //   const acceptedMoves: Record<AcceptedMoves, (player: IPlayer) => void> = {
  //     w(player: IPlayer) {
  //       if (player.y > 0 && player.y >= initialY3 + 10) player.y -= speed
  //     },
  //     a(player: IPlayer) {
  //       if (player.x > 0 && player.x >= initialX3 + 10) player.x -= speed;
  //     },
  //     s(player: IPlayer) {
  //       if (player.y + player.size / 2 < gameState.canvas.height && player.y >= initialY3 && player.x <= initialX3) player.y += speed;
  //     },
  //     d(player: IPlayer) {
  //       if (player.x + player.size / 2 < gameState.canvas.width && player.y <= initialY3) player.x += speed;
  //     },
  //     arrowup(player: IPlayer) {
  //       if (player.y > 0 && player.y >= initialY3 + 10) player.y -= speed
  //     },
  //     arrowleft(player: IPlayer) {
  //       if (player.x > 0 && player.x >= initialX3 + 10) player.x -= speed;
  //     },
  //     arrowdown(player: IPlayer) {
  //       if (player.y + player.size / 2 < gameState.canvas.height && player.y >= initialY3 && player.x <= initialX3) player.y += speed;
  //     },
  //     arrowright(player: IPlayer) {
  //       if (player.x + player.size / 2 < gameState.canvas.width && player.y <= initialY3) player.x += speed;
  //     },
  //   }

  //   if (!message.data.keyPressed) return;
  //   const keyPressed: string = message.data.keyPressed;

  //   if (!message.data.playerId) return;
  //   const playerId: string = message.data.playerId

  //   if (keyPressed in acceptedMoves) {
  //     //const player = gameState.players[playerId]; // Use o playerId do comando
  //     const player = gameState.players[playerId];
  //     const moveFunction = acceptedMoves[keyPressed as AcceptedMoves];

  //     if (player && moveFunction) {
  //       moveFunction(player);
  //     }
  //   }


  //   const data = {
  //     gameState
  //   }
  //   notifyAll({ type: 'movePlayer', data })
  // }

  function movePlayer(playerId: string, keyPressed: string) {

    // VOU DEIXAR AQUI COMENTADO UMA OPÇÃO PARA DEIXAR O MOVIMENTO DOS JOGADORES LIVRE PELA TELA
    // const acceptedMoves: Record<AcceptedMoves, (player: IPlayer) => void> = {
    //   w(player: IPlayer) {
    //     if (player.y > 0) player.y -= speed; // Remova as restrições específicas de posição aqui
    //   },
    //   a(player: IPlayer) {
    //     if (player.x > 0) player.x -= speed;
    //   },
    //   s(player: IPlayer) {
    //     if (player.y + player.size < gameState.canvas.height) player.y += speed;
    //   },
    //   d(player: IPlayer) {
    //     if (player.x + player.size < gameState.canvas.width) player.x += speed;
    //   },
    //   arrowup(player: IPlayer) {
    //     if (player.y > 0) player.y -= speed;
    //   },
    //   arrowleft(player: IPlayer) {
    //     if (player.x > 0) player.x -= speed;
    //   },
    //   arrowdown(player: IPlayer) {
    //     if (player.y + player.size < gameState.canvas.height) player.y += speed;
    //   },
    //   arrowright(player: IPlayer) {
    //     if (player.x + player.size < gameState.canvas.width) player.x += speed;
    //   },
    // };

    // MOVIMENTO SINGLE PLAYER
    // const acceptedMoves: Record<AcceptedMoves, (player: IPlayer) => void> = {
    //   w(player: IPlayer) {
    //     if (player.y > 0 && player.y >= initialY3 + 10) player.y -= speed
    //   },
    //   a(player: IPlayer) {
    //     if (player.x > 0 && player.x >= initialX3 + 10) player.x -= speed;
    //   },
    //   s(player: IPlayer) {
    //     if (player.y + player.size / 2 < gameState.canvas.height && player.y >= initialY3 && player.x <= initialX3) player.y += speed;
    //   },
    //   d(player: IPlayer) {
    //     if (player.x + player.size / 2 < gameState.canvas.width && player.y <= initialY3) player.x += speed;
    //   },
    //   arrowup(player: IPlayer) {
    //     if (player.y > 0 && player.y >= initialY3 + 10) player.y -= speed
    //   },
    //   arrowleft(player: IPlayer) {
    //     if (player.x > 0 && player.x >= initialX3 + 10) player.x -= speed;
    //   },
    //   arrowdown(player: IPlayer) {
    //     if (player.y + player.size / 2 < gameState.canvas.height && player.y >= initialY3 && player.x <= initialX3) player.y += speed;
    //   },
    //   arrowright(player: IPlayer) {
    //     if (player.x + player.size / 2 < gameState.canvas.width && player.y <= initialY3) player.x += speed;
    //   },
    // }

    const acceptedMoves: Record<AcceptedMoves, (player: IPlayer) => void> = {
      w(player: IPlayer) {
        if (player.y > 0 && player.y >= player.initialY + 10) player.y -= speed;
      },
      a(player: IPlayer) {
        if (player.x > 0 && player.x >= player.initialX + 10) player.x -= speed;
      },
      s(player: IPlayer) {
        if (
          player.y + player.size / 2 < gameState.canvas.height &&
          player.y >= player.initialY &&
          player.x <= player.initialX
        ) {
          player.y += speed;
        }
      },
      d(player: IPlayer) {
        if (
          player.x + player.size / 2 < gameState.canvas.width &&
          player.y <= player.initialY
        ) {
          player.x += speed;
        }
      },
      arrowup(player: IPlayer) {
        if (player.y > 0 && player.y >= player.initialY + 10) player.y -= speed;
      },
      arrowleft(player: IPlayer) {
        if (player.x > 0 && player.x >= player.initialX + 10) player.x -= speed;
      },
      arrowdown(player: IPlayer) {
        if (
          player.y + player.size / 2 < gameState.canvas.height &&
          player.y >= player.initialY &&
          player.x <= player.initialX
        ) {
          player.y += speed;
        }
      },
      arrowright(player: IPlayer) {
        if (
          player.x + player.size / 2 < gameState.canvas.width &&
          player.y <= player.initialY
        ) {
          player.x += speed;
        }
      },
    };

    if (!keyPressed || !playerId) return;

    const player = gameState.players[playerId];
    if (!player) return;

    /*     const playerIndex = Object.keys(gameState.players).indexOf(playerId);
        if (playerIndex === -1) return; // Se não encontrar, retorna
    
        const initialPosition = initialPositions[playerIndex]; */

    if (keyPressed in acceptedMoves) {
      const player = gameState.players[playerId];
      const moveFunction = acceptedMoves[keyPressed as AcceptedMoves];

      //moveFunction(player, initialPosition);
      moveFunction(player);
    }

    const data = {
      gameState,
    };
    notifyAll({ type: 'playerMoved', data });
  }


  function moveBall() {
    // Atualiza a posição da bola
    gameState.ball.x += gameState.ball.speedX;
    gameState.ball.y += gameState.ball.speedY;

    // Verifica colisão com as bordas do canvas
    if (gameState.ball.x <= 0 || gameState.ball.x >= gameState.canvas.width) {
      gameState.ball.speedX *= -1;
    }
    if (gameState.ball.y <= 0 || gameState.ball.y >= gameState.canvas.height) {
      gameState.ball.speedY *= -1;
    }

    // Verifica colisão da bola com cada jogador
    for (const playerId in gameState.players) {
      const player = gameState.players[playerId];

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


    // // Verifica colisão da bola com cada jogador
    // for (const playerId in gameState.players) {
    //   const player = gameState.players[playerId];

    //   if (
    //     gameState.ball.x + gameState.ball.radius > player.x &&
    //     gameState.ball.x - gameState.ball.radius < player.x + player.size &&
    //     gameState.ball.y + gameState.ball.radius > player.y &&
    //     gameState.ball.y - gameState.ball.radius < player.y + player.size
    //   ) {
    //     // Rebater a bola ao detectar colisão
    //     gameState.ball.speedX *= -1; // Inverte a direção no eixo X
    //     gameState.ball.speedY *= -1; // Inverte a direção no eixo Y

    //     break; // Sai do loop após detectar a colisão com um jogador
    //   }
    // }

    for (const wall of gameState.walls) {
      if (wall.active) {
        const partWidth = wall.width / 2;
        const partHeight = wall.height / 3;

        for (let i = 0; i < wall.parts.length; i++) {
          if (wall.parts[i]) {
            const partX = wall.x + (i % 2) * partWidth;
            const partY = wall.y + Math.floor(i / 2) * partHeight;

            if (
              gameState.ball.x + gameState.ball.radius > partX &&
              gameState.ball.x - gameState.ball.radius < partX + partWidth &&
              gameState.ball.y + gameState.ball.radius > partY &&
              gameState.ball.y - gameState.ball.radius < partY + partHeight
            ) {

              wall.parts[i] = false;
              gameState.ball.speedX *= -1;
              gameState.ball.speedY *= -1;
              break;
            }
          }
        }
      }
    }
    // Notifica os observadores com o novo estado da bola
    const data = {
      ball: gameState.ball,
    };
    notifyAll({ type: 'moveBall', data });
  }


  function addPlayers(players: IPlayerRoom[]) {
    const positions = [
      { x: 150, y: 150 },
      { x: 630, y: 150 },
      { x: 150, y: 430 },
      { x: 630, y: 430 },
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
      };
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
      };
    }
    console.log("addPlayers", JSON.stringify(gameState.players));
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