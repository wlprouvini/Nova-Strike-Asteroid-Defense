
import React, { useRef, useEffect, useCallback } from 'react';
import { 
  GameState, Ship, Bullet, Asteroid, Particle, Vector, MapConfig 
} from '../types';
import { 
  CANVAS_WIDTH, CANVAS_HEIGHT, SHIP_SIZE, SHIP_THRUST, 
  SHIP_ROTATION_SPEED, SHIP_FRICTION, SHIP_INVULNERABILITY_TIME,
  BULLET_SPEED, BULLET_LIFE, BULLET_COOLDOWN, ASTEROID_SPEED_BASE, ASTEROID_SIZES,
  COLORS, MAPS 
} from '../constants';
import { audio } from '../services/audioService';

interface GameCanvasProps {
  gameState: GameState;
  isMultiplayer: boolean;
  mapConfig: MapConfig;
  onGameOver: (score: number) => void;
  onLevelUp: (level: number) => void;
  onScoreUpdate: (points: number) => void;
  onTogglePause?: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, isMultiplayer, mapConfig, onGameOver, onLevelUp, onScoreUpdate, onTogglePause 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shipsRef = useRef<Ship[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const fireCooldownsRef = useRef<{ [key: number]: number }>({});
  const lastGamepadFireState = useRef<{ [key: number]: boolean }>({});
  const lastPausePress = useRef(0);
  const levelRef = useRef(1);
  const scoreRef = useRef(0);
  const animationFrameRef = useRef<number>();

  const createAsteroids = useCallback((count: number) => {
    const newAsteroids: Asteroid[] = [];
    const shipPos = shipsRef.current[0]?.pos || { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
    
    for (let i = 0; i < count; i++) {
      let x, y;
      do {
        x = Math.random() * CANVAS_WIDTH;
        y = Math.random() * CANVAS_HEIGHT;
      } while (Math.hypot(x - shipPos.x, y - shipPos.y) < 200);

      const sizeMult = mapConfig?.asteroidSizeMult || 1;
      const speedMult = mapConfig?.asteroidSpeedMult || 1;

      newAsteroids.push({
        pos: { x, y },
        vel: {
          x: (Math.random() - 0.5) * ASTEROID_SPEED_BASE * (1 + levelRef.current * 0.1) * speedMult,
          y: (Math.random() - 0.5) * ASTEROID_SPEED_BASE * (1 + levelRef.current * 0.1) * speedMult
        },
        radius: ASTEROID_SIZES.large * sizeMult,
        rotation: Math.random() * Math.PI * 2,
        size: 'large',
        vertices: Array.from({ length: 12 }, () => Math.random() * 0.4 + 0.8)
      });
    }
    asteroidsRef.current = newAsteroids;
  }, [mapConfig]);

  const resetGame = useCallback(() => {
    const player1: Ship = {
      id: 1,
      pos: { x: CANVAS_WIDTH / (isMultiplayer ? 3 : 2), y: CANVAS_HEIGHT / 2 },
      vel: { x: 0, y: 0 },
      radius: SHIP_SIZE,
      rotation: -Math.PI / 2,
      thrusting: false,
      lives: 3,
      invulnerable: SHIP_INVULNERABILITY_TIME,
      score: 0,
      color: COLORS.ship1
    };

    shipsRef.current = [player1];
    if (isMultiplayer) {
      shipsRef.current.push({ ...player1, id: 2, pos: { x: (CANVAS_WIDTH / 3) * 2, y: CANVAS_HEIGHT / 2 }, color: COLORS.ship2 });
    }

    bulletsRef.current = [];
    particlesRef.current = [];
    fireCooldownsRef.current = { 1: 0, 2: 0 };
    lastGamepadFireState.current = { 1: false, 2: false };
    levelRef.current = 1;
    scoreRef.current = 0;
    createAsteroids(5);
  }, [isMultiplayer, createAsteroids]);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      resetGame();
      audio.startMusic();
    }
  }, [gameState, resetGame]);

  const update = () => {
    if (gameState !== GameState.PLAYING) return;
    
    const keys = keysRef.current;
    const gamepads = navigator.getGamepads();

    shipsRef.current.forEach((ship, idx) => {
      const gp = gamepads[idx];
      let rotate = 0, thrust = false, fireRequest = false;

      // Teclado
      if (ship.id === 1) {
        if (keys['ArrowLeft'] || keys['KeyA']) rotate = -1;
        if (keys['ArrowRight'] || keys['KeyD']) rotate = 1;
        if (keys['ArrowUp'] || keys['KeyW']) thrust = true;
        if (keys['Space']) fireRequest = true;
      }

      // Gamepad Xbox
      if (gp) {
        // Rotação Analógico Esquerdo
        if (Math.abs(gp.axes[0]) > 0.15) rotate = gp.axes[0];
        
        // PROPULSÃO: RT (Right Trigger - Índice 7)
        if (gp.buttons[7].pressed || gp.buttons[7].value > 0.1) {
            thrust = true;
        }
        
        // TIRO: LT (Left Trigger - Índice 6)
        // Lógica Semi-Automática: só atira se apertar e não estiver segurando
        const isLTDown = gp.buttons[6].pressed || gp.buttons[6].value > 0.1;
        if (isLTDown && !lastGamepadFireState.current[ship.id]) {
          fireRequest = true;
        }
        lastGamepadFireState.current[ship.id] = isLTDown;

        // Pausa (Botão Menu/Start - Índice 9)
        if (gp.buttons[9].pressed && Date.now() - lastPausePress.current > 500) {
          lastPausePress.current = Date.now();
          onTogglePause?.();
        }
      }

      ship.rotation += rotate * SHIP_ROTATION_SPEED;
      ship.thrusting = thrust;

      if (thrust) {
        ship.vel.x += Math.cos(ship.rotation) * SHIP_THRUST;
        ship.vel.y += Math.sin(ship.rotation) * SHIP_THRUST;
        if (Math.random() > 0.6) {
          particlesRef.current.push({
            pos: { x: ship.pos.x - Math.cos(ship.rotation) * ship.radius, y: ship.pos.y - Math.sin(ship.rotation) * ship.radius },
            vel: { x: -Math.cos(ship.rotation) * 2, y: -Math.sin(ship.rotation) * 2 },
            life: 8, color: COLORS.shipThrust
          });
        }
      }

      if (fireCooldownsRef.current[ship.id] > 0) fireCooldownsRef.current[ship.id]--;
      
      if (fireRequest && fireCooldownsRef.current[ship.id] <= 0) {
        audio.playLaser();
        bulletsRef.current.push({
          ownerId: ship.id,
          pos: { x: ship.pos.x + Math.cos(ship.rotation) * ship.radius, y: ship.pos.y + Math.sin(ship.rotation) * ship.radius },
          vel: { x: Math.cos(ship.rotation) * BULLET_SPEED, y: Math.sin(ship.rotation) * BULLET_SPEED },
          radius: 2, rotation: 0, life: BULLET_LIFE
        });
        fireCooldownsRef.current[ship.id] = BULLET_COOLDOWN;
      }

      ship.pos.x += ship.vel.x; ship.pos.y += ship.vel.y;
      ship.vel.x *= SHIP_FRICTION; ship.vel.y *= SHIP_FRICTION;
      
      if (ship.pos.x < 0) ship.pos.x = CANVAS_WIDTH; else if (ship.pos.x > CANVAS_WIDTH) ship.pos.x = 0;
      if (ship.pos.y < 0) ship.pos.y = CANVAS_HEIGHT; else if (ship.pos.y > CANVAS_HEIGHT) ship.pos.y = 0;
      if (ship.invulnerable > 0) ship.invulnerable--;
    });

    bulletsRef.current = bulletsRef.current.filter(b => {
      b.pos.x += b.vel.x; b.pos.y += b.vel.y;
      b.life--;
      if (b.pos.x < 0) b.pos.x = CANVAS_WIDTH; else if (b.pos.x > CANVAS_WIDTH) b.pos.x = 0;
      if (b.pos.y < 0) b.pos.y = CANVAS_HEIGHT; else if (b.pos.y > CANVAS_HEIGHT) b.pos.y = 0;
      return b.life > 0;
    });

    particlesRef.current = particlesRef.current.filter(p => {
      p.pos.x += p.vel.x; p.pos.y += p.vel.y;
      p.life--;
      return p.life > 0;
    });

    const newAsteroids: Asteroid[] = [];
    asteroidsRef.current = asteroidsRef.current.filter(a => {
      a.pos.x += a.vel.x; a.pos.y += a.vel.y;
      if (a.pos.x < -a.radius) a.pos.x = CANVAS_WIDTH + a.radius; else if (a.pos.x > CANVAS_WIDTH + a.radius) a.pos.x = -a.radius;
      if (a.pos.y < -a.radius) a.pos.y = CANVAS_HEIGHT + a.radius; else if (a.pos.y > CANVAS_HEIGHT + a.radius) a.pos.y = -a.radius;

      let asteroidDestroyed = false;
      
      bulletsRef.current = bulletsRef.current.filter(b => {
        if (asteroidDestroyed) return true;
        const dist = Math.hypot(a.pos.x - b.pos.x, a.pos.y - b.pos.y);
        if (dist < a.radius) {
          asteroidDestroyed = true;
          audio.playExplosion();
          const pts = a.size === 'large' ? 20 : a.size === 'medium' ? 50 : 100;
          onScoreUpdate(pts);
          scoreRef.current += pts;
          
          if (a.size !== 'small') {
            const nextSize = a.size === 'large' ? 'medium' : 'small';
            for (let i = 0; i < 2; i++) {
              newAsteroids.push({
                pos: { ...a.pos },
                vel: { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4 },
                radius: ASTEROID_SIZES[nextSize] * (mapConfig?.asteroidSizeMult || 1),
                rotation: Math.random() * Math.PI * 2, size: nextSize,
                vertices: Array.from({ length: 10 }, () => Math.random() * 0.4 + 0.8)
              });
            }
          }
          return false;
        }
        return true;
      });

      shipsRef.current.forEach(ship => {
        if (ship.invulnerable <= 0 && Math.hypot(ship.pos.x - a.pos.x, ship.pos.y - a.pos.y) < ship.radius + a.radius) {
          ship.lives--;
          audio.playExplosion();
          ship.invulnerable = SHIP_INVULNERABILITY_TIME;
          ship.pos = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
          ship.vel = { x: 0, y: 0 };
          if (ship.lives <= 0 && shipsRef.current.every(s => s.lives <= 0)) onGameOver(scoreRef.current);
        }
      });

      return !asteroidDestroyed;
    });
    asteroidsRef.current.push(...newAsteroids);

    if (asteroidsRef.current.length === 0) {
      levelRef.current++; onLevelUp(levelRef.current); createAsteroids(4 + levelRef.current);
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = MAPS[mapConfig?.id]?.bgColor || '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life / 20; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.pos.x, p.pos.y, 1.5, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.strokeStyle = mapConfig?.color || COLORS.asteroid; ctx.lineWidth = 2;
    asteroidsRef.current.forEach(a => {
      ctx.beginPath();
      a.vertices.forEach((v, i) => {
        const ang = a.rotation + (i / a.vertices.length) * Math.PI * 2;
        const x = a.pos.x + Math.cos(ang) * a.radius * v;
        const y = a.pos.y + Math.sin(ang) * a.radius * v;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath(); ctx.stroke();
    });

    ctx.fillStyle = COLORS.bullet;
    bulletsRef.current.forEach(b => {
      ctx.shadowBlur = 12; ctx.shadowColor = COLORS.bullet;
      ctx.beginPath(); ctx.arc(b.pos.x, b.pos.y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });

    shipsRef.current.forEach(ship => {
      if (ship.lives <= 0) return;
      if (ship.invulnerable % 10 < 5) {
        ctx.save(); ctx.translate(ship.pos.x, ship.pos.y); ctx.rotate(ship.rotation);
        ctx.strokeStyle = ship.color; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(ship.radius, 0); ctx.lineTo(-ship.radius, ship.radius * 0.8);
        ctx.lineTo(-ship.radius * 0.5, 0); ctx.lineTo(-ship.radius, -ship.radius * 0.8); ctx.closePath(); ctx.stroke();
        if (ship.thrusting) {
          ctx.strokeStyle = COLORS.shipThrust; ctx.beginPath();
          ctx.moveTo(-ship.radius * 0.6, -ship.radius * 0.3); ctx.lineTo(-ship.radius * 1.4, 0);
          ctx.lineTo(-ship.radius * 0.6, ship.radius * 0.3); ctx.stroke();
        }
        ctx.restore();
      }
    });
  };

  const loop = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    update(); draw(ctx);
    animationFrameRef.current = requestAnimationFrame(loop);
  }, [gameState, mapConfig]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameRef.current!);
  }, [loop]);

  useEffect(() => {
    const kd = (e: KeyboardEvent) => keysRef.current[e.code] = true;
    const ku = (e: KeyboardEvent) => keysRef.current[e.code] = false;
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, []);

  return <div className="w-full h-full flex items-center justify-center bg-black"><canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="max-w-full max-h-full object-contain" /></div>;
};

export default GameCanvas;
