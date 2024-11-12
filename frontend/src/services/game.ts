import { IGameState, IPlayer } from "../interfaces/game";

export function movePlayerPredict(gameState: IGameState, playerId: string, keyPressed: string) {
  const player = gameState.players[playerId];
  if (!player || !keyPressed) return;

  //const playerIndex = Object.keys(gameState.players).indexOf(playerId);
  //if (playerIndex === -1) return;
  const playerIndex = player.defendingPlanetId;
  //Eu ia adicionar uma propriedade de posição no player mas o defendingPlanetId já serve para isso

  const speed = 10;

  // Função auxiliar para verificar se o player está na posição inicial
  const isAtInitialPosition = (player: IPlayer) => {
    return Math.abs(player.x - player.initialX) < speed &&
      Math.abs(player.y - player.initialY) < speed;
  };

  // Função auxiliar para verificar se o player está no limite vertical
  const isAtVerticalLimit = (player: IPlayer, isTop: boolean) => {
    return isTop ? player.y <= 0 : player.y + player.size >= gameState.canvas.height;
  };

  // Função auxiliar para verificar se o player está no limite horizontal
  const isAtHorizontalLimit = (player: IPlayer, isRight: boolean) => {
    return isRight ? player.x + player.size >= gameState.canvas.width : player.x <= 0;
  };

  const moveLogic = {
    // Player Superior Esquerdo (índice 0)
    0: {
      right: (player: IPlayer) => {
        if (player.x < player.initialX) {
          // Movimento horizontal para direita até posição inicial
          player.x = Math.min(player.x + speed, player.initialX);
        } else if (!isAtVerticalLimit(player, true)) {
          // Subir depois de atingir posição inicial
          player.y = Math.max(player.y - speed, 0);
        }
      },
      left: (player: IPlayer) => {
        if (player.y === player.initialY) {
          // Movimento horizontal para esquerda
          player.x = Math.max(player.x - speed, 0);
        } else if (player.x === player.initialX) {
          // Descer de volta à posição inicial
          player.y = Math.min(player.y + speed, player.initialY);
        }
      }
    },
    // Player Superior Direito (índice 1)
    1: {
      right: (player: IPlayer) => {
        if (player.y === player.initialY) {
          // Movimento horizontal para direita, considerando o tamanho do player
          player.x = Math.min(player.x + speed, gameState.canvas.width - player.size);
        } else if (player.x === player.initialX) {
          // Descer de volta à posição inicial
          player.y = Math.min(player.y + speed, player.initialY);
        }
      },
      left: (player: IPlayer) => {
        if (player.x > player.initialX) {
          // Movimento horizontal para esquerda até posição inicial
          player.x = Math.max(player.x - speed, player.initialX);
        } else if (!isAtVerticalLimit(player, true)) {
          // Subir depois de atingir posição inicial
          player.y = Math.max(player.y - speed, 0);
        }
      }
    },
    // Player Inferior Esquerdo (índice 2)
    2: {
      right: (player: IPlayer) => {
        if (player.x < player.initialX) {
          // Movimento horizontal para direita até posição inicial
          player.x = Math.min(player.x + speed, player.initialX);
        } else if (!isAtVerticalLimit(player, false)) {
          // Descer depois de atingir posição inicial
          player.y = Math.min(player.y + speed, gameState.canvas.height - player.size);
        }
      },
      left: (player: IPlayer) => {
        if (player.y === player.initialY) {
          // Movimento horizontal para esquerda
          player.x = Math.max(player.x - speed, 0);
        } else if (player.x === player.initialX) {
          // Subir de volta à posição inicial
          player.y = Math.max(player.y - speed, player.initialY);
        }
      }
    },
    // Player Inferior Direito (índice 3)
    3: {
      right: (player: IPlayer) => {
        if (player.y === player.initialY) {
          // Movimento horizontal para direita, considerando o tamanho do player
          player.x = Math.min(player.x + speed, gameState.canvas.width - player.size);
        } else if (player.x === player.initialX) {
          // Subir de volta à posição inicial
          player.y = Math.max(player.y - speed, player.initialY);
        }
      },
      left: (player: IPlayer) => {
        if (player.x > player.initialX) {
          // Movimento horizontal para esquerda até posição inicial
          player.x = Math.max(player.x - speed, player.initialX);
        } else if (!isAtVerticalLimit(player, false)) {
          // Descer depois de atingir posição inicial
          player.y = Math.min(player.y + speed, gameState.canvas.height - player.size);
        }
      }
    }
  };

  // Mapeamento de diferente teclas para um padrão fixo
  const keyMap: { [key: string]: string } = {
    arrowleft: 'left',
    arrowright: 'right',
    a: 'left',
    d: 'right'
  };

  // Executa o movimento baseado no índice do jogador e tecla pressionada
  const playerMoveLogic = moveLogic[playerIndex as keyof typeof moveLogic];
  const direction = keyMap[keyPressed.toLowerCase()];

  if (playerMoveLogic && direction in playerMoveLogic) {
    playerMoveLogic[direction as keyof typeof playerMoveLogic](player);
  }

  return {
    direction: keyPressed,
    x: player.x,
    y: player.y
  };
}