import { IGameState, planetImages, playersImages } from "../../interfaces/game";

// Primeiro, vamos criar uma interface para armazenar o histórico de posições
interface IBallTrailPosition {
  x: number;
  y: number;
}

// Array para armazenar o histórico de posições da bola
let ballTrailPositions: IBallTrailPosition[] = [];
const TRAIL_LENGTH = 10; // Quantidade de posições que queremos manter no histórico

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

  // Atualizar o histórico de posições da bola
  ballTrailPositions.push({
    x: gameState.ball.x,
    y: gameState.ball.y
  });

  // Manter apenas as últimas TRAIL_LENGTH posições
  if (ballTrailPositions.length > TRAIL_LENGTH) {
    ballTrailPositions.shift();
  }

  // Desenhar a trilha do cometa
  ballTrailPositions.forEach((position, index) => {
    const opacity = (index + 1) / ballTrailPositions.length;
    const radius = (gameState.ball.radius * (index + 1)) / ballTrailPositions.length;
    
    // Desenhar o rastro com gradiente
    context.beginPath();
    context.arc(position.x, position.y, radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
    context.fill();
  });

  // Desenhar o brilho ao redor da bola
  const gradient = context.createRadialGradient(
    gameState.ball.x, 
    gameState.ball.y, 
    gameState.ball.radius * 0.5,
    gameState.ball.x, 
    gameState.ball.y, 
    gameState.ball.radius * 2
  );
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  context.beginPath();
  context.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius * 2, 0, Math.PI * 2);
  context.fillStyle = gradient;
  context.fill();

  // Desenhar a bola principal (núcleo do cometa)
  context.beginPath();
  context.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
  context.fillStyle = gameState.ball.color;
  context.fill();

  // O resto do seu código para desenhar planetas e players permanece o mesmo
  const planets = gameState.planets;
  const players = gameState.players;
  planets.forEach((planet, index) => {
    if (planet.active && planetImages.length > index) {
      //const image = planetImages[index];
      const image = planetImages[players[planet.ownerId].defendingPlanetId];
      const partWidth = planet.width / 2;
      const partHeight = planet.height / 3;
  
      for (let i = 0; i < planet.parts.length; i++) {
        if (planet.parts[i]) {
          const partX = planet.x + (i % 2) * partWidth;
          const partY = planet.y + Math.floor(i / 2) * partHeight;
  
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

  Object.entries(gameState.players).forEach(([playerId, player], index) => {
    //const playerImage = playersImages[index % playersImages.length];
    const playerImage = playersImages[player.defendingPlanetId];
    const centerX = player.x;
    const centerY = player.y;

    if (playerId === currentPlayerId) {
      context.strokeStyle = '#00ff00';
      context.lineWidth = 2;
      context.strokeRect(centerX, centerY, player.size, player.size);
    }

    context.drawImage(playerImage, centerX, centerY, player.size, player.size);
  });
}



// import { IGameState, planetImages, playersImages } from "../../interfaces/game";


// export default function renderScreen(
//   canvasScreen: HTMLCanvasElement,
//   gameState: IGameState,
//   requestAnimationFrame: (callback: FrameRequestCallback) => number,
//   currentPlayerId: string,
//   backgroundImage: HTMLImageElement,
// ) {
//   const context = canvasScreen.getContext('2d');
//   if (!context) throw new Error("Could not get 2D context from canvas.");

//   // Clear and draw background
//   context.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
//   context.drawImage(backgroundImage, 0, 0, gameState.canvas.width, gameState.canvas.height);

//   // Draw ball
//   context.fillStyle = gameState.ball.color;
//   context.beginPath();
//   context.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
//   context.fill();

//   const planets = gameState.planets;
//   planets.forEach((planet, index) => {
//     if (planet.active && planetImages.length > index) {
//       const image = planetImages[index]; // Use as imagens pré-carregadas
//       const partWidth = planet.width / 2;
//       const partHeight = planet.height / 3;
  
//       for (let i = 0; i < planet.parts.length; i++) {
//         if (planet.parts[i]) { // Verifica se a parte está ativa
//           const partX = planet.x + (i % 2) * partWidth;
//           const partY = planet.y + Math.floor(i / 2) * partHeight;
  
//           // Desenha a parte da imagem
//           context.drawImage(
//             image,
//             (i % 2) * (image.width / 2),
//             Math.floor(i / 2) * (image.height / 3),
//             image.width / 2,
//             image.height / 3,
//             partX,
//             partY,
//             partWidth,
//             partHeight
//           );
//         }
//       }
//     }
//   });
  

//   // Draw players
//   Object.entries(gameState.players).forEach(([playerId, player], index) => {
//     const playerImage = playersImages[index % playersImages.length];
//     const centerX = player.x;
//     const centerY = player.y;

//     // Highlight current player
//     if (playerId === currentPlayerId) {
//       context.strokeStyle = '#00ff00';
//       context.lineWidth = 2;
//       context.strokeRect(centerX, centerY, player.size, player.size);
//     }

//     context.drawImage(playerImage, centerX, centerY, player.size, player.size);
//   });
// }