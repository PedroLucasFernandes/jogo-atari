export type AcceptedMoves = 'w' | 'a' | 's' | 'd' | 'arrowup' | 'arrowleft' | 'arrowdown' | 'arrowright';

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
  'bot0': { x: 170, y: 150, size: 80, isBot: true, imageSrc: '' }, 
  'bot1': { x: 550, y: 150, size: 80, isBot: true, imageSrc: '' }, 
  'bot2': { x: 170, y: 370, size: 80, isBot: true, imageSrc: '' }, 
  'bot3': { x: 550, y: 370, size: 80, isBot: false, imageSrc: '' } 
};

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