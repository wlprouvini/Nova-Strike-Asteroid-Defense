
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 800;

export const SHIP_SIZE = 20;
export const SHIP_THRUST = 0.15;
export const SHIP_ROTATION_SPEED = 0.1;
export const SHIP_FRICTION = 0.985;
export const SHIP_INVULNERABILITY_TIME = 120;

export const BULLET_SPEED = 8;
export const BULLET_LIFE = 60;
export const BULLET_COOLDOWN = 10;

export const ASTEROID_SPEED_BASE = 1.5;
export const ASTEROID_SIZES = {
  large: 60,
  medium: 30,
  small: 15
};

export const COLORS = {
  ship1: '#3b82f6',
  ship2: '#10b981',
  shipThrust: '#facc15',
  asteroid: '#94a3b8',
  bullet: '#f43f5e',
  particle: '#fca5a5'
};

export const MAPS: Record<string, any> = {
  orion: {
    id: 'orion',
    name: 'Cinturão de Órion',
    description: 'Setor padrão com densidade de asteroides equilibrada.',
    asteroidSpeedMult: 1,
    asteroidSizeMult: 1,
    color: '#94a3b8',
    bgColor: 'rgba(0,0,0,1)'
  },
  crystal: {
    id: 'crystal',
    name: 'Nebulosa de Cristal',
    description: 'Asteroides velozes e fragmentos cortantes.',
    asteroidSpeedMult: 1.5,
    asteroidSizeMult: 0.7,
    color: '#22d3ee',
    bgColor: 'rgba(10,20,40,1)'
  },
  void: {
    id: 'void',
    name: 'Vácuo Profundo',
    description: 'Asteroides maciços e visibilidade reduzida.',
    asteroidSpeedMult: 0.7,
    asteroidSizeMult: 1.8,
    color: '#a855f7',
    bgColor: 'rgba(15,0,25,1)'
  }
};
