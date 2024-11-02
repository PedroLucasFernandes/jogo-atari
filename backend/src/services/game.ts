import { AcceptedMoves, IGameMessage, IGameState, initialBallState, initialCanvasState, initialPlayersState, initialWallsState, IPlayer } from "../interfaces/game"

export default function createGame(message: IGameMessage) {

  const gameState: IGameState = {
    players: {
      'bot1': initialPlayersState[0],
      'bot2': initialPlayersState[1],
      'bot3': initialPlayersState[2],
      [message.data.playerId]: initialPlayersState[3],
    },
    walls: initialWallsState,
    ball: initialBallState,
    canvas: initialCanvasState,
  }

  const speed = 10;
  const initialY3 = 470;
  const initialX3 = 670;

  function movePlayer(command: IGameMessage) {

    const acceptedMoves: Record<AcceptedMoves, (player: IPlayer) => void> = {
      w(player: IPlayer) {
        if (player.y > 0 && player.y >= initialY3 + 10) player.y -= speed
      },
      d(player: IPlayer) {
        if (player.x + player.size / 2 < gameState.canvas.width && player.y <= initialY3) player.x += speed;
      },
      s(player: IPlayer) {
        if (player.y + player.size / 2 < gameState.canvas.height && player.y >= initialY3 && player.x <= initialX3) player.y += speed;
      },
      a(player: IPlayer) {
        if (player.x > 0 && player.x >= initialX3 + 10) player.x -= speed;
      }
    }

    if (!command.data.keyPressed) return;
    const keyPressed: string = command.data.keyPressed;

    if (!command.data.playerId) return;
    const playerId = command.data.playerId

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
  }
}