export type AcceptedMoves = 'w' | 'a' | 's' | 'd' | 'arrowup' | 'arrowleft' | 'arrowdown' | 'arrowright';

export interface IPlanet {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean; // Para saber se a parede está ativa
  parts: boolean[]; // Cada parte representará um fragmento da imagem
  imageSrc: string; // Caminho da imagem do planeta
}

export interface IPlayer {
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
  planets: IPlanet[];
  ball: IBall;
  canvas: ICanvas;
}

export interface IGameMessage {
  type: string;
  data: {
    playerId?: string;
    roomId?: string;
    code?: string;
    keyPressed?: string;
    gameState?: IGameState;
    ball?: IBall;
    planets?: IPlanet[];
    player?: IPlayer;
  }
}

export interface IGame {
  gameState: IGameState;
  movePlayer: (message: IGameMessage) => void;
  subscribe(observerFunction: (message: IGameMessage) => void): void;
  setState(newState: Partial<IGameState>): void;
  addPlayer(playerId: string): void;
  start: () => void;
  stop: () => void;
}

export const initialPlanetsState: IPlanet[] = [
  { x: 0, y: 0, width: 150, height: 150, active: true, parts: [true, true, true, true, true, true], imageSrc: '' },
  { x: 650, y: 0, width: 150, height: 150, active: true, parts: [true, true, true, true, true, true], imageSrc: '' },
  { x: 0, y: 450, width: 150, height: 150, active: true, parts: [true, true, true, true, true, true], imageSrc: '' },
  { x: 650, y: 450, width: 150, height: 150, active: true, parts: [true, true, true, true, true, true], imageSrc: '' }
];

export const initialPlayersState: PlayersRecord = {
  'bot0': { x: 170, y: 150, size: 80, isBot: true, imageSrc: '' }, // Centro do "L" frente ao planeta superior esquerdo
  'bot1': { x: 630, y: 150, size: 80, isBot: true, imageSrc: '' }, // Centro do "L" frente ao planeta superior direito
  'bot2': { x: 170, y: 450, size: 80, isBot: true, imageSrc: '' }, // Centro do "L" frente ao planeta inferior esquerdo
  'bot3': { x: 630, y: 450, size: 80, isBot: false, imageSrc: '' }  // Centro do "L" frente ao planeta inferior direito
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





