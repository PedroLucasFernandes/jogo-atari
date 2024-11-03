import { IGame, IPlayer, IWall } from "../../interfaces/game"

function renderWalls(context: CanvasRenderingContext2D, walls: IWall[]) {
  walls.forEach((wall) => {
    if (wall.active) {
      context.fillStyle = 'gray';
      const partWidth = wall.width / 2;
      const partHeight = wall.height / 3;

      for (let i = 0; i < wall.parts.length; i++) {
        if (wall.parts[i]) {
          const partX = wall.x + (i % 2) * partWidth;
          const partY = wall.y + Math.floor(i / 2) * partHeight;
          context.fillRect(partX, partY, partWidth, partHeight);
        }
      }
    }
  });
}

export default function renderScreen(
  canvasScreen: HTMLCanvasElement,
  game: IGame,
  requestAnimationFrame: (callback: FrameRequestCallback) => number,
  currentPlayerId: string,
  backgroundImage: HTMLImageElement
) {

  const context = canvasScreen.getContext('2d')

  if (!context) {
    throw new Error("Não foi possível obter o contexto 2D do canvas.");
  }

  context.clearRect(0, 0, 800, 600);

    // Desenha a imagem de fundo
    context.drawImage(backgroundImage, 0, 0, game.gameState.canvas.width, game.gameState.canvas.height);


  context.fillStyle = game.gameState.ball.color;
  context.beginPath();
  context.arc(game.gameState.ball.x, game.gameState.ball.y, game.gameState.ball.radius, 0, Math.PI * 2);
  context.fill();

    // Renderiza as paredes
    renderWalls(context, game.gameState.walls);

  // game.gameState.walls.forEach((wall) => {
  //   if (wall.active) {
  //     context.fillStyle = 'gray';
  //     context.fillRect(wall.x, wall.y, wall.width, wall.height);
  //   }
  // });

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
    renderScreen(canvasScreen, game, requestAnimationFrame, currentPlayerId, backgroundImage)
  })
}