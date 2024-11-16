import { IGameState, planetImages, playersImages } from "../../interfaces/game";

interface IBallTrailPosition {
  x: number;
  y: number;
}

let ballTrailPositions: IBallTrailPosition[] = [];
const TRAIL_LENGTH = 10;

export default function renderScreen(
  canvasScreen: HTMLCanvasElement,
  gameStateRef: React.MutableRefObject<IGameState | null>,
  currentPlayerId: string,
) {
  const gameState = gameStateRef.current;
  if (!gameState) return;

  interpolateBall(0.5);
  interpolatePlayer(0.5);

  const context = canvasScreen.getContext('2d');
  if (!context) throw new Error("Could not get 2D context from canvas.");

  context.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);

  ballTrailPositions.push({
    x: gameState.ball.x,
    y: gameState.ball.y
  });

  if (ballTrailPositions.length > TRAIL_LENGTH) {
    ballTrailPositions.shift();
  }

  ballTrailPositions.forEach((position, index) => {
    const opacity = (index + 1) / ballTrailPositions.length;
    const radius = (gameState.ball.radius * (index + 1)) / ballTrailPositions.length;

    context.beginPath();
    context.arc(position.x, position.y, radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
    context.fill();
  });

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

  context.beginPath();
  context.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
  context.fillStyle = gameState.ball.color;
  context.fill();

  const planets = gameState.planets;
  const players = gameState.players;
  planets.forEach((planet, index) => {
    if (planet.active && planetImages.length > index) {
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

          context.globalAlpha = 0.06; // Ajuste para o nível de transparência desejado
          context.fillStyle = 'white'; // Ou uma cor ligeiramente mais clara

          context.fillRect(partX + 1, partY + 1, partWidth - 2, partHeight - 2);

          context.globalAlpha = 1.0;
        }
      }
    }
  });

  Object.entries(gameState.players).forEach(([playerId, player], index) => {

    if(!player.active){
      console.log("O player ficou inativo")
    }
    if (!player.active) return; // Ignorar jogadores inativos
    
    const playerImage = playersImages[player.defendingPlanetId];
    const centerX = player.x;
    const centerY = player.y;

    context.drawImage(playerImage, centerX, centerY, player.size, player.size);

    // Adiciona o nome do jogador abaixo da imagem
    context.font = '16px "Pixelify Sans", sans-serif'; // Tamanho da fonte do nome
    context.fillStyle = 'white'; // Cor do nome
    context.textAlign = 'center'; // Alinha o texto ao centro
    context.textBaseline = 'top'; // Alinha o texto acima da linha de base (aqui fica logo abaixo da imagem)
    context.fillText(player.username, centerX + player.size / 2, centerY + player.size); // Desenha o nome abaixo da imagem
  });


  // Função para interpolar entre a posição inicial e a posição alvo
  function interpolatePlayer(interpolationFactor: number) {
    if (!gameState) return;

    Object.keys(gameState.players).forEach((playerId) => {
      if (playerId === currentPlayerId) return;

      const player = gameState.players[playerId];
      const interpolatedX = Math.round(player.x + (player.toX - player.x) * interpolationFactor);
      const interpolatedY = Math.round(player.y + (player.toY - player.y) * interpolationFactor);

      // Atualiza as posições de cada jogador no objeto interpolado
      gameState.players[playerId] = {
        ...player,
        x: interpolatedX,
        y: interpolatedY,
      };
    });
  }

  function interpolateBall(interpolationFactor: number) {
    if (!gameState) return;

    const ball = gameState.ball;
    const interpolatedX = Math.round(ball.x + (ball.toX - ball.x) * interpolationFactor);
    const interpolatedY = Math.round(ball.y + (ball.toY - ball.y) * interpolationFactor);

    // Atualiza as posições de cada jogador no objeto interpolado
    gameState.ball = {
      ...ball,
      x: interpolatedX,
      y: interpolatedY,
    };
  }
}