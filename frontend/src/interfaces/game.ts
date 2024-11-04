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
  { x: 20, y: 20, width: 80, height: 80, active: true, parts: [true, true, true, true, true, true], imageSrc: '' },
  { x: 700, y: 20, width: 80, height: 80, active: true, parts: [true, true, true, true, true, true] , imageSrc: ''},
  { x: 20, y: 500, width: 80, height: 80, active: true, parts: [true, true, true, true, true, true] , imageSrc: ''},
  { x: 700, y: 500, width: 80, height: 80, active: true, parts: [true, true, true, true, true, true] , imageSrc: ''}
];

export const initialPlayersState: PlayersRecord = {
  'bot0': { x: 150, y: 150, size: 80, isBot: true, imageSrc: '' }, // Movido mais para dentro do canvas
  'bot1': { x: 630, y: 150, size: 80, isBot: true, imageSrc: '' }, // Movido mais para dentro do canvas
  'bot2': { x: 150, y: 430, size: 80, isBot: true, imageSrc: '' }, // Movido mais para dentro do canvas
  'bot3': { x: 630, y: 430, size: 80, isBot: false, imageSrc: '' } // Movido mais para dentro do canvas
}

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

// export const planetImages = Array.from({ length: 4 }, (_, i) => {
//   const img = new Image();
//   img.src = `/assets/planet${i + 1}.svg`;
  
//   // Adiciona um listener para debug
//   img.onload = () => console.log(`Planet ${i + 1} loaded successfully`);
//   img.onerror = (e) => console.error(`Error loading planet ${i + 1}:`, e);
  
//   return img;
// });
