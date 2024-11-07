import { IGameState, planetImages, playersImages } from "../../interfaces/game";


export default function renderScreen(
  canvasScreen: HTMLCanvasElement,
  gameState: IGameState,
  requestAnimationFrame: (callback: FrameRequestCallback) => number,
  currentPlayerId: string,
  backgroundImage: HTMLImageElement,
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

  const planets = gameState.planets;
  planets.forEach((planet, index) => {
    if (planet.active && planetImages.length > index) {
      const image = planetImages[index]; // Use as imagens pré-carregadas
      const partWidth = planet.width / 2;
      const partHeight = planet.height / 3;
  
      for (let i = 0; i < planet.parts.length; i++) {
        if (planet.parts[i]) { // Verifica se a parte está ativa
          const partX = planet.x + (i % 2) * partWidth;
          const partY = planet.y + Math.floor(i / 2) * partHeight;
  
          // Desenha a parte da imagem
          context.drawImage(
            image,
            (i % 2) * (image.width / 2),
            Math.floor(i / 2) * (image.height / 3),
            image.width / 2,
            image.height / 3,
            partX,
            partY,
            partWidth,
            partHeight
          );
        }
      }
    }
  });
  

  // Draw players
  Object.entries(gameState.players).forEach(([playerId, player], index) => {
    const playerImage = playersImages[index % playersImages.length];
    const centerX = player.x;
    const centerY = player.y;

    // Highlight current player
    if (playerId === currentPlayerId) {
      context.strokeStyle = '#00ff00';
      context.lineWidth = 2;
      context.strokeRect(centerX, centerY, player.size, player.size);
    }

    context.drawImage(playerImage, centerX, centerY, player.size, player.size);
  });
}