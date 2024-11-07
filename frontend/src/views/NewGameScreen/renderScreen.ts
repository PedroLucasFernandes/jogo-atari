import { IGame, playersImages, planetImages } from "../../interfaces/game"


export default function renderScreen(
  canvasScreen: HTMLCanvasElement,
  game: IGame,
  currentPlayerId: string,
  backgroundImage: HTMLImageElement,
  planetImages: HTMLImageElement[],
  playerImages: HTMLImageElement[]
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

  const planets = game.gameState.planets;
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
  

  const playerIds = Object.keys(game.gameState.players);
  playerIds.forEach((playerId, index) => {
    const player = game.gameState.players[playerId];

    const playerImage = playersImages[index % playersImages.length];

    const centerX = player.x; 
    const centerY = player.y;

    context.drawImage(playerImage, centerX, centerY, player.size, player.size);
  });
}