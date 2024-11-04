import { IGameState, IWall, playersImages } from "../../interfaces/game";

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
  gameState: IGameState,
  requestAnimationFrame: (callback: FrameRequestCallback) => number,
  currentPlayerId: string,
  backgroundImage: HTMLImageElement
) {
  const context = canvasScreen.getContext('2d');
  if (!context) throw new Error("Could not get 2D context from canvas.");

  // Clear and draw background
  context.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
  context.drawImage(backgroundImage, 0, 0, gameState.canvas.width, gameState.canvas.height);

  // Draw ball
  context.fillStyle = gameState.ball.color;
  context.beginPath();
  context.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
  context.fill();

  // Draw walls
  renderWalls(context, gameState.walls);

  // Draw players
  Object.entries(gameState.players).forEach(([playerId, player], index) => {
    const playerImage = playersImages[index % playersImages.length];
    const centerX = player.x - player.size / 2;
    const centerY = player.y - player.size / 2;

    // Highlight current player
    if (playerId === currentPlayerId) {
      context.strokeStyle = '#00ff00';
      context.lineWidth = 2;
      context.strokeRect(centerX, centerY, player.size, player.size);
    }

    context.drawImage(playerImage, centerX, centerY, player.size, player.size);
  });

  requestAnimationFrame(() => {
    renderScreen(canvasScreen, gameState, requestAnimationFrame, currentPlayerId, backgroundImage);
  });
}
