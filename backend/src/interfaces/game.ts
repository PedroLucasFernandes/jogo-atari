export type gameStatus = 'lobby' | 'waiting' | 'inprogress' | 'paused' | 'finished';
export const chatColors = ["amaranth", "amber", "amethyst", "apricot", "aqua", "aquamarine", "black", "blue", "blush", "bronze", "brown", "chocolate", "coffee", "copper", "coral", "crimson", "cyan", "emerald", "fuchsia", "gold", "gray", "green", "harlequin", "indigo", "jade", "lime", "magenta", "maroon", "moccasin", "olive", "orange", "peach", "pink", "plum", "purple", "red", "rose", "salmon", "sapphire", "scarlet", "silver", "tan", "teal", "tomato", "turquoise", "violet"]
//Cores removidos por serem muito claras, readicionar se mudar a cor do fundo
const lightColors = ["azure", "beige", "ivory", "lavender", "white", "yellow"];

export interface IPlanet {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean; // Para saber se o planeta está ativa
  parts: boolean[]; // Cada parte representará um fragmento da imagem
  imageSrc: string; // Caminho da imagem do planeta
  ownerId: string;
}

export interface IPlayer {
  //O id do player é a própria chave no PlayersRecord
  username: string;
  x: number;
  y: number;
  toX: number;
  toY: number;
  initialX: number;
  initialY: number;
  size: number;
  isBot: boolean;
  imageSrc: string;
  defendingPlanetId: number;
  active: boolean;
}

export type PlayersRecord = Record<string, IPlayer>;

export interface IBall {
  x: number;
  y: number;
  toX: number;
  toY: number;
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
  code: string | null;
  status: gameStatus;
  host: string;
  players: IPlayerRoom[];
}

interface Winner {
  username: string;
  id: string;
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
    moveNumber?: number;
    move?: IMove;
    gameState?: IGameState;
    ball?: IBall;
    message?: string;
    roomState?: IRoomState;
    rooms?: IRoomState[];
    planets?: IPlanet[];
    player?: IPlayer;
    winner?: Winner;
    position?: IPosition;
    result?: string;
    playerActive?: boolean
    chatMessage?: IChatMessage;
  }
}

export interface IGame {
  gameState: IGameState;
  movePlayer: (playerId: string, keyPressed: string, moveNumber: number) => void;
  subscribe(observerFunction: (message: IGameMessage) => void): void;
  setState(newState: Partial<IGameState>): void;
  addPlayers(players: IPlayerRoom[]): void;
  start: () => void;
  stop: () => void;
}

export const initialPlanetsState: IPlanet[] = [
  { x: 0, y: 0, width: 150, height: 150, active: true, parts: [true, true, true, true, true, true], imageSrc: '', ownerId: '' },
  { x: 650, y: 0, width: 150, height: 150, active: true, parts: [true, true, true, true, true, true], imageSrc: '', ownerId: '' },
  { x: 0, y: 450, width: 150, height: 150, active: true, parts: [true, true, true, true, true, true], imageSrc: '', ownerId: '' },
  { x: 650, y: 450, width: 150, height: 150, active: true, parts: [true, true, true, true, true, true], imageSrc: '', ownerId: '' }
];

export const initialPlayersState: PlayersRecord = {
  'player0': { username: 'Player 0', x: 170, y: 150, initialX: 170, initialY: 150, toX: 170, toY: 150, size: 80, isBot: true, imageSrc: '', defendingPlanetId: 0, active: false },
  'player1': { username: 'Player 1', x: 550, y: 150, initialX: 550, initialY: 150, toX: 550, toY: 150, size: 80, isBot: true, imageSrc: '', defendingPlanetId: 1, active: false },
  'player2': { username: 'Player 2', x: 170, y: 370, initialX: 170, initialY: 370, toX: 170, toY: 370, size: 80, isBot: true, imageSrc: '', defendingPlanetId: 2, active: false },
  'player3': { username: 'Player 3', x: 550, y: 370, initialX: 550, initialY: 370, toX: 550, toY: 370, size: 80, isBot: false, imageSrc: '', defendingPlanetId: 3, active: false }
};

export const planetsByPlayersPosition = [
  { player: { x: 170, y: 150 }, planet: { x: 0, y: 0 }, defendingPlanetId: 0 },
  { player: { x: 550, y: 150 }, planet: { x: 650, y: 0 }, defendingPlanetId: 1 },
  { player: { x: 170, y: 370 }, planet: { x: 0, y: 450 }, defendingPlanetId: 2 },
  { player: { x: 550, y: 370 }, planet: { x: 650, y: 450 }, defendingPlanetId: 3 }
];

export const initialBallState: IBall = {
  x: 400,
  y: 300,
  toX: 400,
  toY: 300,
  radius: 10,
  speedX: 10,
  speedY: 10,
  color: 'white'
};

export const initialCanvasState: ICanvas = {
  width: 800,
  height: 600
};

export const initialPlayersRoomState: IPlayerRoom[] = [
  { playerId: 'player0', username: 'Player 0', ready: false, isHost: false },
  { playerId: 'player1', username: 'Player 1', ready: false, isHost: false },
  { playerId: 'player2', username: 'Player 2', ready: false, isHost: false },
  { playerId: 'player3', username: 'Player 3', ready: false, isHost: false }
]

export const initialRoomState: IRoomState = {
  roomId: '',
  code: '',
  status: 'lobby',
  host: '',
  players: initialPlayersRoomState
}

export interface IMove {
  direction: string;
  x: number;
  y: number;
  moveNumber: number;
}

export interface ILastMove {
  playerId: string;
  move: IMove
}

export interface IPosition {
  x: number;
  y: number;
}

export interface IChatMessage {
  type: string;
  playerId?: string;
  username: string;
  content: string;
  color: string;
}
