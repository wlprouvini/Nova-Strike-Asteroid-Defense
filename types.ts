
export interface Vector {
  x: number;
  y: number;
}

export interface Entity {
  pos: Vector;
  vel: Vector;
  radius: number;
  rotation: number;
}

export interface Ship extends Entity {
  id: number;
  thrusting: boolean;
  lives: number;
  invulnerable: number;
  score: number;
  color: string;
}

export interface Bullet extends Entity {
  ownerId: number;
  life: number;
}

export interface MapConfig {
  id: string;
  name: string;
  description: string;
  asteroidSpeedMult: number;
  asteroidSizeMult: number;
  color: string;
  bgColor: string;
}

export interface Asteroid extends Entity {
  size: 'large' | 'medium' | 'small';
  vertices: number[];
}

export interface Particle {
  pos: Vector;
  vel: Vector;
  life: number;
  color: string;
}

export enum GameState {
  MENU = 'MENU',
  LOBBY = 'LOBBY',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  PAUSED = 'PAUSED'
}

export interface GameStatus {
  score: number;
  level: number;
  highScore: number;
  state: GameState;
  isMultiplayer: boolean;
  selectedMap: string;
}

export interface PilotAdvice {
  title: string;
  advice: string;
}
