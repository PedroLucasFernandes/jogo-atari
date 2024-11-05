export type AcceptedMoves = 'w' | 'a' | 's' | 'd' | 'arrowup' | 'arrowleft' | 'arrowdown' | 'arrowright';
export type gameStatus = 'lobby' | 'inprogress' | 'paused' | 'finished';

// export interface IWall {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   active: boolean;
// }

export interface IWall {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean; // Para saber se a parede está ativa
  parts: boolean[]; // Representa se cada parte está ativa (true) ou removida (false)
}

export interface IPlayer {
  //O id do player é a própria chave no PlayersRecord
  username: string;
  x: number;
  y: number;
  size: number;
  isBot: boolean;
  imageSrc: string;
}

export type PlayersRecord = Record<string, IPlayer>;

export interface IBall {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  color: string;
}

export interface ICanvas {
  width: number;
  height: number;
}
export interface IGameState {
  players: PlayersRecord;
  walls: IWall[];
  ball: IBall;
  canvas: ICanvas;
}

export interface IGameMessage {
  type: string;
  data: {
    playerId?: string;
    username?: string;
    roomId?: string;
    code?: string;
    keyPressed?: string;
    gameState?: IGameState;
    ball?: IBall;
    message?: string;
  }
}

export interface IGame {
  gameState: IGameState;
  movePlayer: (message: IGameMessage) => void;
  subscribe(observerFunction: (message: IGameMessage) => void): void;
  setState(newState: Partial<IGameState>): void;
  addPlayer(playerId: string, username: string, position: number): void;
  start: () => void;
  stop: () => void;
}

export const initialWallsState: IWall[] = [
  { x: 20, y: 20, width: 80, height: 80, active: true, parts: [true, true, true, true, true, true] },
  { x: 700, y: 20, width: 80, height: 80, active: true, parts: [true, true, true, true, true, true] },
  { x: 20, y: 500, width: 80, height: 80, active: true, parts: [true, true, true, true, true, true] },
  { x: 700, y: 500, width: 80, height: 80, active: true, parts: [true, true, true, true, true, true] }
];

export const initialPlayersState: PlayersRecord = {
  'bot0': { username: 'Bot 0', x: 150, y: 150, size: 80, isBot: true, imageSrc: '' }, // Movido mais para dentro do canvas
  'bot1': { username: 'Bot 1', x: 630, y: 150, size: 80, isBot: true, imageSrc: '' }, // Movido mais para dentro do canvas
  'bot2': { username: 'Bot 2', x: 150, y: 430, size: 80, isBot: true, imageSrc: '' }, // Movido mais para dentro do canvas
  'bot3': { username: 'Bot 3', x: 630, y: 430, size: 80, isBot: false, imageSrc: '' } // Movido mais para dentro do canvas
};


export const initialBallState: IBall = {
  x: 400,
  y: 300,
  radius: 10,
  speedX: 3,
  speedY: 3,
  color: 'white'
};

export const initialCanvasState: ICanvas = {
  width: 800,
  height: 600
};





