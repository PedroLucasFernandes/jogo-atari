import { AcceptedMoves, IGameMessage, IGameState, initialBallState, initialCanvasState, initialPlayersState, initialWallsState, IPlayer, PlayersRecord } from "../interfaces/game"

export default function createGame() {

  /* const gameState: IGameState = {
    players: {
      'bot0': initialPlayersState[0],
      'bot1': initialPlayersState[1],
      'bot2': initialPlayersState[2],
      'bot3': initialPlayersState[3],

      //[message.data.playerId]: initialPlayersState[3],
    },
    walls: initialWallsState,
    ball: initialBallState,
    canvas: initialCanvasState,
  } */

  const gameState: IGameState = {
    players: initialPlayersState,
    walls: initialWallsState,
    ball: initialBallState,
    canvas: initialCanvasState,
  }

  const speed = 10;
  const initialY3 = 470;
  const initialX3 = 670;

  //const observers = [];

  //const observers: ((message: IGameMessage) => void)[] = [];
  const observers: Array<(message: IGameMessage) => void> = [];

  let intervalId: NodeJS.Timeout | null = null;

  function start() {
    const frequency = 1000 / 60

    intervalId = setInterval(moveBall, frequency);
  }

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




  function movePlayer(message: IGameMessage) {

    //notifyAll(message)

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

    if (!message.data.keyPressed) return;
    const keyPressed: string = message.data.keyPressed;

    if (!message.data.playerId) return;
    const playerId: string = message.data.playerId

    if (keyPressed in acceptedMoves) {
      //const player = gameState.players[playerId]; // Use o playerId do comando
      const player = gameState.players[playerId];
      const moveFunction = acceptedMoves[keyPressed as AcceptedMoves];

      if (player && moveFunction) {
        moveFunction(player);
      }
    }


    const data = {
      gameState
    }
    notifyAll({ type: 'movePlayer', data })
  }

  function moveBall() {
    gameState.ball.x += gameState.ball.speedX;
    gameState.ball.y += gameState.ball.speedY;

    if (gameState.ball.x <= 0 || gameState.ball.x >= 800) gameState.ball.speedX *= -1;
    if (gameState.ball.y <= 0 || gameState.ball.y >= 600) gameState.ball.speedY *= -1;

    const data = {
      ball: gameState.ball,
    }

    notifyAll({ type: 'moveBall', data })
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