
import React, { useRef, useEffect, useCallback } from 'react';
import { 
  GameState, Ship, Bullet, Asteroid, Particle, Vector 
} from '../types';
import { 
  CANVAS_WIDTH, CANVAS_HEIGHT, SHIP_SIZE, SHIP_THRUST, 
  SHIP_ROTATION_SPEED, SHIP_FRICTION, SHIP_INVULNERABILITY_TIME,
  BULLET_SPEED, BULLET_LIFE, BULLET_COOLDOWN, ASTEROID_SPEED_BASE, ASTEROID_SIZES,
  COLORS 
} from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  onGameOver: (score: number) => void;
  onLevelUp: (level: number) => void;
  onScoreUpdate: (points: number) => void;
  onTogglePause?: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, onGameOver, onLevelUp, onScoreUpdate, onTogglePause 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game state refs
  const shipRef = useRef<Ship>({
    pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
    vel: { x: 0, y: 0 },
    radius: SHIP_SIZE,
    rotation: -Math.PI / 2,
    thrusting: false,
    lives: 3,
    invulnerable: SHIP_INVULNERABILITY_TIME
  });
  
  const bulletsRef = useRef<Bullet[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const fireCooldownRef = useRef(0);
  const pauseDebounceRef = useRef(0);
  const levelRef = useRef(1);
  const scoreRef = useRef(0);
  const animationFrameRef = useRef<number>();

  const createAsteroids = useCallback((count: number) => {
    const newAsteroids: Asteroid[] = [];
    const shipPos = shipRef.current.pos;
    
    for (let i = 0; i < count; i++) {
      let x, y;
      do {
        x = Math.random() * CANVAS_WIDTH;
        y = Math.random() * CANVAS_HEIGHT;
      } while (Math.hypot(x - shipPos.x, y - shipPos.y) < 200);

      const vertices = Array.from({ length: 10 }, () => Math.random() * 0.4 + 0.8);
      
      newAsteroids.push({
        pos: { x, y },
        vel: {
          x: (Math.random() - 0.5) * ASTEROID_SPEED_BASE * (1 + levelRef.current * 0.1),
          y: (Math.random() - 0.5) * ASTEROID_SPEED_BASE * (1 + levelRef.current * 0.1)
        },
        radius: ASTEROID_SIZES.large,
        rotation: Math.random() * Math.PI * 2,
        size: 'large',
        vertices
      });
    }
    asteroidsRef.current = newAsteroids;
  }, []);

  const resetGame = useCallback(() => {
    shipRef.current = {
      pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
      vel: { x: 0, y: 0 },
      radius: SHIP_SIZE,
      rotation: -Math.PI / 2,
      thrusting: false,
      lives: 3,
      invulnerable: SHIP_INVULNERABILITY_TIME
    };
    bulletsRef.current = [];
    particlesRef.current = [];
    fireCooldownRef.current = 0;
    levelRef.current = 1;
    scoreRef.current = 0;
    createAsteroids(5);
  }, [createAsteroids]);

  useEffect(() => {
    if (gameState === GameState.PLAYING && !animationFrameRef.current) {
      resetGame();
    }
  }, [gameState, resetGame]);

  const createExplosion = (pos: Vector, color: string, count: number = 8) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        pos: { ...pos },
        vel: {
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4
        },
        life: 30 + Math.random() * 30,
        color
      });
    }
  };

  const fireBullet = () => {
    const ship = shipRef.current;
    const b: Bullet = {
      pos: {
        x: ship.pos.x + Math.cos(ship.rotation) * ship.radius,
        y: ship.pos.y + Math.sin(ship.rotation) * ship.radius
      },
      vel: {
        x: Math.cos(ship.rotation) * BULLET_SPEED + ship.vel.x,
        y: Math.sin(ship.rotation) * BULLET_SPEED + ship.vel.y
      },
      radius: 2,
      rotation: 0,
      life: BULLET_LIFE
    };
    bulletsRef.current.push(b);
    fireCooldownRef.current = BULLET_COOLDOWN;
  };

  const update = () => {
    const keys = keysRef.current;
    const ship = shipRef.current;

    // Gamepad Polling
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0]; // Pega o primeiro controle
    
    let gpRotate = 0;
    let gpThrust = false;
    let gpFire = false;
    let gpPause = false;

    if (gp) {
      // Analógico Esquerdo Horizontal (Eixo 0)
      if (Math.abs(gp.axes[0]) > 0.1) gpRotate = gp.axes[0];
      // Analógico Esquerdo Vertical (Eixo 1) - Invertido pois -1 é pra cima
      if (gp.axes[1] < -0.2) gpThrust = true;
      // Botão A (Índice 0) ou RT (Índice 7)
      if (gp.buttons[0].pressed || gp.buttons[7].pressed) gpFire = true;
      // Botão Start (Índice 9)
      if (gp.buttons[9].pressed) gpPause = true;
    }

    // Handle Gamepad Pause (with debounce)
    if (gpPause && pauseDebounceRef.current <= 0) {
      onTogglePause?.();
      pauseDebounceRef.current = 30; // 0.5s de cooldown para o botão pause
    }
    if (pauseDebounceRef.current > 0) pauseDebounceRef.current--;

    if (gameState !== GameState.PLAYING) return;

    // Movement: Rotation (Keyboard + Gamepad)
    if (keys['ArrowLeft'] || keys['KeyA']) ship.rotation -= SHIP_ROTATION_SPEED;
    if (keys['ArrowRight'] || keys['KeyD']) ship.rotation += SHIP_ROTATION_SPEED;
    if (gpRotate !== 0) ship.rotation += gpRotate * SHIP_ROTATION_SPEED;

    // Movement: Thrust
    ship.thrusting = !!(keys['ArrowUp'] || keys['KeyW'] || gpThrust);
    if (ship.thrusting) {
      ship.vel.x += Math.cos(ship.rotation) * SHIP_THRUST;
      ship.vel.y += Math.sin(ship.rotation) * SHIP_THRUST;
      
      if (Math.random() > 0.5) {
        particlesRef.current.push({
          pos: { 
            x: ship.pos.x - Math.cos(ship.rotation) * ship.radius, 
            y: ship.pos.y - Math.sin(ship.rotation) * ship.radius 
          },
          vel: {
            x: -Math.cos(ship.rotation) * 2 + (Math.random() - 0.5),
            y: -Math.sin(ship.rotation) * 2 + (Math.random() - 0.5)
          },
          life: 15,
          color: COLORS.shipThrust
        });
      }
    }

    // Firing Logic
    if (fireCooldownRef.current > 0) fireCooldownRef.current--;
    if ((keys['Space'] || gpFire) && fireCooldownRef.current <= 0) {
      fireBullet();
    }

    // Physics
    ship.pos.x += ship.vel.x;
    ship.pos.y += ship.vel.y;
    ship.vel.x *= SHIP_FRICTION;
    ship.vel.y *= SHIP_FRICTION;

    // Wrap Ship
    if (ship.pos.x < 0) ship.pos.x = CANVAS_WIDTH;
    if (ship.pos.x > CANVAS_WIDTH) ship.pos.x = 0;
    if (ship.pos.y < 0) ship.pos.y = CANVAS_HEIGHT;
    if (ship.pos.y > CANVAS_HEIGHT) ship.pos.y = 0;

    if (ship.invulnerable > 0) ship.invulnerable--;

    // Entities update
    bulletsRef.current = bulletsRef.current.filter(b => {
      b.pos.x += b.vel.x;
      b.pos.y += b.vel.y;
      b.life--;
      if (b.pos.x < 0) b.pos.x = CANVAS_WIDTH;
      if (b.pos.x > CANVAS_WIDTH) b.pos.x = 0;
      if (b.pos.y < 0) b.pos.y = CANVAS_HEIGHT;
      if (b.pos.y > CANVAS_HEIGHT) b.pos.y = 0;
      return b.life > 0;
    });

    particlesRef.current = particlesRef.current.filter(p => {
      p.pos.x += p.vel.x;
      p.pos.y += p.vel.y;
      p.life--;
      return p.life > 0;
    });

    asteroidsRef.current.forEach(a => {
      a.pos.x += a.vel.x;
      a.pos.y += a.vel.y;
      a.rotation += 0.01;
      if (a.pos.x < -a.radius) a.pos.x = CANVAS_WIDTH + a.radius;
      if (a.pos.x > CANVAS_WIDTH + a.radius) a.pos.x = -a.radius;
      if (a.pos.y < -a.radius) a.pos.y = CANVAS_HEIGHT + a.radius;
      if (a.pos.y > CANVAS_HEIGHT + a.radius) a.pos.y = -a.radius;

      if (ship.invulnerable <= 0) {
        const dist = Math.hypot(ship.pos.x - a.pos.x, ship.pos.y - a.pos.y);
        if (dist < ship.radius + a.radius) {
          ship.lives--;
          createExplosion(ship.pos, COLORS.ship, 20);
          ship.pos = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
          ship.vel = { x: 0, y: 0 };
          ship.invulnerable = SHIP_INVULNERABILITY_TIME;
          if (ship.lives <= 0) onGameOver(scoreRef.current);
        }
      }
    });

    const newAsteroids: Asteroid[] = [];
    asteroidsRef.current = asteroidsRef.current.filter(a => {
      let destroyed = false;
      bulletsRef.current = bulletsRef.current.filter(b => {
        if (destroyed) return true;
        const dist = Math.hypot(a.pos.x - b.pos.x, a.pos.y - b.pos.y);
        if (dist < a.radius) {
          destroyed = true;
          createExplosion(a.pos, COLORS.asteroid, 10);
          let points = a.size === 'large' ? 20 : a.size === 'medium' ? 50 : 100;
          if (a.size !== 'small') splitAsteroid(a, a.size === 'large' ? 'medium' : 'small', newAsteroids);
          scoreRef.current += points;
          onScoreUpdate(points);
          return false;
        }
        return true;
      });
      return !destroyed;
    });
    asteroidsRef.current.push(...newAsteroids);

    if (asteroidsRef.current.length === 0) {
      levelRef.current++;
      onLevelUp(levelRef.current);
      createAsteroids(4 + levelRef.current);
    }
  };

  const splitAsteroid = (parent: Asteroid, nextSize: 'medium' | 'small', list: Asteroid[]) => {
    const radius = ASTEROID_SIZES[nextSize];
    for (let i = 0; i < 2; i++) {
      list.push({
        pos: { ...parent.pos },
        vel: {
          x: (Math.random() - 0.5) * ASTEROID_SPEED_BASE * 2,
          y: (Math.random() - 0.5) * ASTEROID_SPEED_BASE * 2
        },
        radius,
        rotation: Math.random() * Math.PI * 2,
        size: nextSize,
        vertices: Array.from({ length: 10 }, () => Math.random() * 0.4 + 0.8)
      });
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life / 60;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.strokeStyle = COLORS.asteroid;
    ctx.lineWidth = 2;
    asteroidsRef.current.forEach(a => {
      ctx.beginPath();
      for (let i = 0; i < a.vertices.length; i++) {
        const angle = a.rotation + (i / a.vertices.length) * Math.PI * 2;
        const r = a.radius * a.vertices[i];
        const x = a.pos.x + Math.cos(angle) * r;
        const y = a.pos.y + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    });

    ctx.fillStyle = COLORS.bullet;
    bulletsRef.current.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.pos.x, b.pos.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    const ship = shipRef.current;
    if (ship.invulnerable % 10 < 5) {
      ctx.save();
      ctx.translate(ship.pos.x, ship.pos.y);
      ctx.rotate(ship.rotation);
      ctx.shadowBlur = 10;
      ctx.shadowColor = COLORS.ship;
      ctx.strokeStyle = COLORS.ship;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ship.radius, 0);
      ctx.lineTo(-ship.radius, ship.radius * 0.8);
      ctx.lineTo(-ship.radius * 0.6, 0);
      ctx.lineTo(-ship.radius, -ship.radius * 0.8);
      ctx.closePath();
      ctx.stroke();
      if (ship.thrusting) {
        ctx.strokeStyle = COLORS.shipThrust;
        ctx.beginPath();
        ctx.moveTo(-ship.radius * 0.8, -ship.radius * 0.4);
        ctx.lineTo(-ship.radius * 1.5, 0);
        ctx.lineTo(-ship.radius * 0.8, ship.radius * 0.4);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    update();
    draw(ctx);
    animationFrameRef.current = requestAnimationFrame(loop);
  }, [gameState, onTogglePause]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [loop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      keysRef.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
};

export default GameCanvas;
