import { IGame, IPlayer, IPlanet, playersImages, planetImages } from "../../interfaces/game"


// function renderPlanets(context: CanvasRenderingContext2D, planets: IPlanet[], planetImages: HTMLImageElement[]) {
//   planets.forEach((planet, index) => {
//     if (planet.active) {
//       const image = planetImages[index % planetImages.length]; // Seleciona a imagem do planeta correspondente
//       const partWidth = planet.width / 2;
//       const partHeight = planet.height / 3;

//       for (let i = 0; i < planet.parts.length; i++) {
//         if (planet.parts[i]) {
//           const partX = planet.x + (i % 2) * partWidth;
//           const partY = planet.y + Math.floor(i / 2) * partHeight;

//           // Desenha a parte da imagem
//           context.drawImage(
//             image,
//             (i % 2) * (image.width / 2), // X de origem na imagem
//             Math.floor(i / 2) * (image.height / 3), // Y de origem na imagem
//             image.width / 2, // Largura da parte da imagem
//             image.height / 3, // Altura da parte da imagem
//             partX, // X de destino no canvas
//             partY, // Y de destino no canvas
//             partWidth, // Largura no canvas
//             partHeight // Altura no canvas
//           );
//         }
//       }
//     }
//   });
// }


// function renderPlanets(context: CanvasRenderingContext2D, planets: IPlanet[]) {
//   planets.forEach((planet) => {
//     if (planet.active) {
//       context.fillStyle = 'gray';
//       const partWidth = planet.width / 2;
//       const partHeight = planet.height / 3;

//       for (let i = 0; i < planet.parts.length; i++) {
//         if (planet.parts[i]) {
//           const partX = planet.x + (i % 2) * partWidth;
//           const partY = planet.y + Math.floor(i / 2) * partHeight;
//           context.fillRect(partX, partY, partWidth, partHeight);
//         }
//       }
//     }
//   });
// }

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

  // // Renderiza as paredes
  // renderPlanets(context, game.gameState.planets, planetImages);

  const planets = game.gameState.planets;

  planets.forEach((planet, index)=>{
    if (planet.active) {
      const image = planetImages[index % planetImages.length]; // Seleciona a imagem do planeta correspondente
      const partWidth = planet.width / 2;
      const partHeight = planet.height / 3;

      for (let i = 0; i < planet.parts.length; i++) {
        if (planet.parts[i]) {
          const partX = planet.x + (i % 2) * partWidth;
          const partY = planet.y + Math.floor(i / 2) * partHeight;

          // Desenha a parte da imagem
          context.drawImage(
            image,
            (i % 2) * (image.width / 2), // X de origem na imagem
            Math.floor(i / 2) * (image.height / 3), // Y de origem na imagem
            image.width / 2, // Largura da parte da imagem
            image.height / 3, // Altura da parte da imagem
            partX, // X de destino no canvas
            partY, // Y de destino no canvas
            partWidth, // Largura no canvas
            partHeight // Altura no canvas
          );
        }
      }
    }
  })

  const playerIds = Object.keys(game.gameState.players); // Lista de IDs dos jogadores

  playerIds.forEach((playerId, index) => {
    const player = game.gameState.players[playerId];

    const playerImage = playersImages[index % playersImages.length];
    //const playerImage = player.isBot ? playersImages[4] : playersImages[index % playersImages.length];

    const centerX = player.x - player.size / 2;
    const centerY = player.y - player.size / 2;
    context.drawImage(playerImage, centerX, centerY, player.size, player.size);
  });

  requestAnimationFrame(() => {
    renderScreen(canvasScreen, game, requestAnimationFrame, currentPlayerId, backgroundImage)
  })
}