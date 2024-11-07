export type AcceptedMoves = 'w' | 'a' | 's' | 'd' | 'arrowup' | 'arrowleft' | 'arrowdown' | 'arrowright';
export type gameStatus = 'lobby' | 'waiting' | 'inprogress' | 'paused' | 'finished';

export interface IWall {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  parts: boolean[];
}

export interface IPlayer {
  //O id do player é a própria chave no PlayersRecord
  username: string;
  x: number;
  y: number;
  initialX: number;
  initialY: number;
  size: number;
  isBot: boolean;
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

export interface IPlayerRoom {
  playerId: string;
  username: string;
  ready: boolean;
  isHost: boolean;
}

export interface IRoomState {
  roomId: string;
  status: gameStatus;
  host: string;
  players: IPlayerRoom[];
}

export interface IGameState {
  players: PlayersRecord;
  walls: IWall[];
  ball: IBall;
  canvas: ICanvas;
  room: IRoomState;
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
    roomState?: IRoomState;
    rooms?: IRoomState[];
  }
}

export interface IGame {
  gameState: IGameState;
  movePlayer: (command: IGameMessage) => void;
}

export const initialWallsState: IWall[] = [
  { x: 20, y: 20, width: 80, height: 80, active: true, parts: [true, true, true, true, true, true] },
  { x: 700, y: 20, width: 80, height: 80, active: true, parts: [true, true, true, true, true, true] },
  { x: 20, y: 500, width: 80, height: 80, active: true, parts: [true, true, true, true, true, true] },
  { x: 700, y: 500, width: 80, height: 80, active: true, parts: [true, true, true, true, true, true] }
];

export const initialPlayersState: PlayersRecord = {
  'bot0': { username: 'Bot 0', x: 150, y: 150, initialX: 150, initialY: 150, size: 80, isBot: true }, // Movido mais para dentro do canvas
  'bot1': { username: 'Bot 1', x: 630, y: 150, initialX: 630, initialY: 150, size: 80, isBot: true }, // Movido mais para dentro do canvas
  'bot2': { username: 'Bot 2', x: 150, y: 430, initialX: 150, initialY: 430, size: 80, isBot: true }, // Movido mais para dentro do canvas
  'bot3': { username: 'Bot 3', x: 630, y: 430, initialX: 630, initialY: 430, size: 80, isBot: false } // Movido mais para dentro do canvas
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

export const initialPlayersRoomState: IPlayerRoom[] = [
  { playerId: 'bot0', username: 'Bot 0', ready: false, isHost: false },
  { playerId: 'bot1', username: 'Bot 1', ready: false, isHost: false },
  { playerId: 'bot2', username: 'Bot 2', ready: false, isHost: false },
  { playerId: 'bot3', username: 'Bot 3', ready: false, isHost: false }
]

export const initialRoomState: IRoomState = {
  roomId: '',
  status: 'lobby',
  host: '',
  players: initialPlayersRoomState
}


export const playersImages = Array.from({ length: 5 }, (_, i) => {
  const img = new Image(300, 300);
  img.src = `/assets/player${i + 1}.svg`;
  return img;
});


