
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
  thrusting: boolean;
  lives: number;
  invulnerable: number; // frames remaining
}

export interface Bullet extends Entity {
  life: number; // frames until expiry
}

export interface Asteroid extends Entity {
  size: 'large' | 'medium' | 'small';
  vertices: number[]; // random offsets for irregular shape
}

export interface Particle {
  pos: Vector;
  vel: Vector;
  life: number;
  color: string;
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  PAUSED = 'PAUSED'
}

export interface GameStatus {
  score: number;
  level: number;
  highScore: number;
  state: GameState;
}

export interface PilotAdvice {
  title: string;
  advice: string;
}
