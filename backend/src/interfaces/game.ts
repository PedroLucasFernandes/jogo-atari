export type AcceptedMoves = 'w' | 'a' | 's' | 'd';

export interface IWall {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}

export interface IPlayer {
  x: number;
  y: number;
  size: number;
  color: string;
  isBot: boolean;

}

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
  players: Record<string, IPlayer>;
  walls: IWall[];
  ball: IBall;
  canvas: ICanvas;
}

export interface IGameMessage {
  type: string;
  data: {
    playerId: string;
    roomId?: string;
    code?: string;
    keyPressed?: string;
    gameState?: IGameState;
  }
}

export interface IGame {
  gameState: IGameState;
  movePlayer: (command: IGameMessage) => void;
}

export const initialWallsState: IWall[] = [
  { x: 20, y: 20, width: 80, height: 80, active: true },
  { x: 700, y: 20, width: 80, height: 80, active: true },
  { x: 20, y: 500, width: 80, height: 80, active: true },
  { x: 700, y: 500, width: 80, height: 80, active: true }
];

export const initialPlayersState: IPlayer[] = [
  { x: 110, y: 110, size: 20, color: 'blue', isBot: true },
  { x: 670, y: 110, size: 20, color: 'green', isBot: true },
  { x: 110, y: 470, size: 20, color: 'yellow', isBot: true },
  { x: 670, y: 470, size: 20, color: 'red', isBot: false }
];

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





