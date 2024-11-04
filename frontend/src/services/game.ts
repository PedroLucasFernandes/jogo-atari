import { AcceptedMoves, IGameMessage, IGameState, initialBallState, initialCanvasState, initialPlayersState, initialPlanetsState, IPlayer } from "../interfaces/game"

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

  function movePlayer(message: IGameMessage) {

    notifyAll(message)

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
    const playerId = message.data.playerId

    if (keyPressed in acceptedMoves) {
      const player = gameState.players[playerId]; // Use o playerId do comando
      const moveFunction = acceptedMoves[keyPressed as AcceptedMoves];

      if (player && moveFunction) {
        moveFunction(player);
      }
    }
  }

  return {
    gameState,
    movePlayer,
    subscribe,
    setState
  }
}