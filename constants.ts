
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 800;

export const SHIP_SIZE = 20;
export const SHIP_THRUST = 0.15;
export const SHIP_ROTATION_SPEED = 0.1;
export const SHIP_FRICTION = 0.985;
export const SHIP_INVULNERABILITY_TIME = 120; // 2 seconds at 60fps

export const BULLET_SPEED = 8;
export const BULLET_LIFE = 60; // 1 second
export const BULLET_COOLDOWN = 10; // Frames between shots (aprox 6 shots per second)

export const ASTEROID_SPEED_BASE = 1.5;
export const ASTEROID_SIZES = {
  large: 60,
  medium: 30,
  small: 15
};

export const COLORS = {
  ship: '#3b82f6', // Blue 500
  shipThrust: '#facc15', // Yellow 400
  asteroid: '#94a3b8', // Slate 400
  bullet: '#f43f5e', // Rose 500
  particle: '#fca5a5' // Rose 300
};
