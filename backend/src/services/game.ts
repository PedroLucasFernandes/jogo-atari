import { AcceptedMoves, IGameMessage, IGameState, initialBallState, initialCanvasState, initialPlayersState, initialPlanetsState, IPlayer, PlayersRecord } from "../interfaces/game"


export default function createGame() {


  const gameState: IGameState = {
    players: initialPlayersState,
    planets: initialPlanetsState,
    ball: initialBallState,
    canvas: initialCanvasState,
  }

  const speed = 3;
  const initialY3 = 450;
  const initialX3 = 630;
  const MAX_SPEED = 3; // Limite de velocidade


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

  function movePlayer(message: IGameMessage) {

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

    const acceptedMoves: Record<AcceptedMoves, (player: IPlayer) => void> = {
      w(player: IPlayer) {
        if (player.y > 0 && player.y >= initialY3 + 10) player.y -= speed
      },
      a(player: IPlayer) {
        if (player.x > 0 && player.x >= initialX3 + 10) player.x -= speed;
      },
      s(player: IPlayer) {
        if (player.y + player.size / 2 < gameState.canvas.height && player.y >= initialY3 && player.x <= initialX3) player.y += speed;
      },
      d(player: IPlayer) {
        if (player.x + player.size / 2 < gameState.canvas.width && player.y <= initialY3) player.x += speed;
      },
      arrowup(player: IPlayer) {
        if (player.y > 0 && player.y >= initialY3 + 10) player.y -= speed
      },
      arrowleft(player: IPlayer) {
        if (player.x > 0 && player.x >= initialX3 + 10) player.x -= speed;
      },
      arrowdown(player: IPlayer) {
        if (player.y + player.size / 2 < gameState.canvas.height && player.y >= initialY3 && player.x <= initialX3) player.y += speed;
      },
      arrowright(player: IPlayer) {
        if (player.x + player.size / 2 < gameState.canvas.width && player.y <= initialY3) player.x += speed;
      },
    }

    if (!message.data.keyPressed || !message.data.playerId) return;
    const keyPressed: string = message.data.keyPressed;

    // if (!message.data.playerId) return; //(juntei ali em cima numa validação só)
    const playerId: string = message.data.playerId;

    if (keyPressed in acceptedMoves) {
      const player = gameState.players[playerId];
      const moveFunction = acceptedMoves[keyPressed as AcceptedMoves];

      if (player && moveFunction) {
        moveFunction(player);
        notifyAll({ type: 'movePlayer', data: { gameState } })
      }
    }
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
    if (gameState.ball.x <= 0 || gameState.ball.x >= gameState.canvas.width) {
      gameState.ball.speedX *= -1;
    }
    if (gameState.ball.y <= 0 || gameState.ball.y >= gameState.canvas.height) {
      gameState.ball.speedY *= -1;
    }

    // Verifica colisão da bola com cada jogador
    for (const playerId in gameState.players) {
      const player = gameState.players[playerId];

      const collisionMargin = 2; // Ajuste conforme necessário
      if (
        gameState.ball.x + gameState.ball.radius > player.x - collisionMargin &&
        gameState.ball.x - gameState.ball.radius < player.x + player.size + collisionMargin &&
        gameState.ball.y + gameState.ball.radius > player.y - collisionMargin &&
        gameState.ball.y - gameState.ball.radius < player.y + player.size + collisionMargin
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
        notifyPlanetUpdate();
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
  }


  function addPlayer(playerId: string) {
    const { bot3, ...remainingPlayers } = gameState.players;

    const updatedPlayersState: PlayersRecord = {
      ...remainingPlayers,
      [playerId]: bot3
    };

    setState({ players: updatedPlayersState });
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
    addPlayer,
    stop
  }
}