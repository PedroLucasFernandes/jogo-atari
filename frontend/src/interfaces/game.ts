export type AcceptedMoves = 'w' | 'a' | 's' | 'd' | 'arrowup' | 'arrowleft' | 'arrowdown' | 'arrowright';
export type gameStatus = 'lobby' | 'waiting' | 'inprogress' | 'paused' | 'finished';

export interface IPlanet {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  parts: boolean[];
  imageSrc: string; // Caminho da imagem do planeta
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
  planets: IPlanet[];
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

export const initialPlanetsState: IPlanet[] = [
  { x: 0, y: 0, width: 150, height: 150, active: true, parts: [true, true, true, true, true, true], imageSrc: '' },
  { x: 650, y: 0, width: 150, height: 150, active: true, parts: [true, true, true, true, true, true], imageSrc: '' },
  { x: 0, y: 450, width: 150, height: 150, active: true, parts: [true, true, true, true, true, true], imageSrc: '' },
  { x: 650, y: 450, width: 150, height: 150, active: true, parts: [true, true, true, true, true, true], imageSrc: '' }
];

export const initialPlayersState: PlayersRecord = {
  'bot0': { username: 'Bot 0', x: 170, y: 150, initialX: 170, initialY: 150, size: 80, isBot: true }, 
  'bot1': { username: 'Bot 1', x: 550, y: 150, initialX: 550, initialY: 150, size: 80, isBot: true }, 
  'bot2': { username: 'Bot 2', x: 170, y: 370, initialX: 170, initialY: 370, size: 80, isBot: true }, 
  'bot3': { username: 'Bot 3', x: 550, y: 370, initialX: 550, initialY: 370, size: 80, isBot: false } 
};;

export const initialBallState: IBall = {
  x: 400,
  y: 300,
  radius: 10,
  speedX: 5,
  speedY: 5,
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

export const planetImages = Array.from({ length: 4 }, (_, i) => {
  const img = new Image();
  img.src = `/assets/planet${i + 1}.svg`;
  return img;
});