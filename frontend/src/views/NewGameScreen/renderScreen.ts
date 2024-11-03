import { IGame, IPlayer } from "../../interfaces/game"

export default function renderScreen(
  canvasScreen: HTMLCanvasElement,
  game: IGame,
  requestAnimationFrame: (callback: FrameRequestCallback) => number,
  currentPlayerId: string
) {

  const context = canvasScreen.getContext('2d')

  if (!context) {
    throw new Error("Não foi possível obter o contexto 2D do canvas.");
  }

  context.clearRect(0, 0, 800, 600);

  context.fillStyle = game.gameState.ball.color;
  context.beginPath();
  context.arc(game.gameState.ball.x, game.gameState.ball.y, game.gameState.ball.radius, 0, Math.PI * 2);
  context.fill();

  game.gameState.walls.forEach((wall) => {
    if (wall.active) {
      context.fillStyle = 'gray';
      context.fillRect(wall.x, wall.y, wall.width, wall.height);
    }
  });

  for (const playerId in game.gameState.players) {
    const player = game.gameState.players[playerId];
    context.fillStyle = player.color
    const centerX = player.x - player.size / 2;
    const centerY = player.y - player.size / 2;
    context.fillRect(centerX, centerY, player.size, player.size);
  }

  /* context.fillStyle = 'white';
  context.font = '16px Arial';
  lives.forEach((life, index) => {
      context.fillText(`Player ${index + 1} Vidas: ${life}`, 10, 20 + index * 20);
  }); */

  requestAnimationFrame(() => {
    renderScreen(canvasScreen, game, requestAnimationFrame, currentPlayerId)
  })
}