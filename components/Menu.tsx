
import React, { useState, useEffect, useRef } from 'react';
import { PilotAdvice } from '../types';
import { MAPS } from '../constants';
import { audio } from '../services/audioService';

interface MenuProps {
  type: 'start' | 'paused' | 'gameover' | 'lobby';
  onStart: (map?: string) => void;
  onOpenLobby?: () => void;
  onMenu?: () => void;
  score?: number;
  highScore?: number;
  advice?: PilotAdvice | null;
  isLoadingAdvice?: boolean;
}

const Menu: React.FC<MenuProps> = ({ 
  type, onStart, onOpenLobby, onMenu, score, highScore, advice, isLoadingAdvice 
}) => {
  const [focusIndex, setFocusIndex] = useState(0);
  const [selectedMapIndex, setSelectedMapIndex] = useState(0);
  const lastInputTime = useRef(0);
  const mapKeys = Object.keys(MAPS);

  useEffect(() => {
    const pollGamepad = () => {
      const gp = navigator.getGamepads()[0];
      if (gp) {
        const now = Date.now();
        if (now - lastInputTime.current > 180) {
          // Navegação Vertical
          if (type !== 'lobby') {
            const up = gp.axes[1] < -0.5 || gp.buttons[12].pressed;
            const down = gp.axes[1] > 0.5 || gp.buttons[13].pressed;
            if (up) {
              setFocusIndex(prev => (prev - 1 + 2) % 2);
              lastInputTime.current = now;
            } else if (down) {
              setFocusIndex(prev => (prev + 1) % 2);
              lastInputTime.current = now;
            }
          } else {
            // Navegação Horizontal (Lobby)
            const left = gp.axes[0] < -0.5 || gp.buttons[14].pressed;
            const right = gp.axes[0] > 0.5 || gp.buttons[15].pressed;
            if (left) {
              setSelectedMapIndex(prev => (prev - 1 + mapKeys.length) % mapKeys.length);
              lastInputTime.current = now;
            } else if (right) {
              setSelectedMapIndex(prev => (prev + 1) % mapKeys.length);
              lastInputTime.current = now;
            }
          }

          // BOTÃO A (Índice 0) para Confirmar
          if (gp.buttons[0].pressed) {
            audio.init(); // Ativa o som na primeira interação
            if (type === 'start') {
              focusIndex === 0 ? onStart() : onOpenLobby?.();
            } else if (type === 'lobby') {
              onStart(mapKeys[selectedMapIndex]);
            } else if (type === 'paused' || type === 'gameover') {
              focusIndex === 0 ? onStart() : onMenu?.();
            }
            lastInputTime.current = now + 400; // Delay maior para evitar double click
          }

          // BOTÃO B (Índice 1) para Voltar
          if (gp.buttons[1].pressed) {
            onMenu?.();
            lastInputTime.current = now + 400;
          }
        }
      }
      requestAnimationFrame(pollGamepad);
    };
    const id = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(id);
  }, [type, focusIndex, selectedMapIndex, onStart, onMenu, onOpenLobby, mapKeys]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className={`w-full ${type === 'lobby' ? 'max-w-4xl' : 'max-w-md'} p-8 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-2xl text-center space-y-8`}>
        
        {type === 'start' && (
          <>
            <div className="space-y-2">
              <h1 className="text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-600 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                NOVA STRIKE
              </h1>
              <p className="text-sm font-mono text-blue-400/60 tracking-[0.3em] uppercase">
                Space Superiority Protocol
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => { audio.init(); onStart(); }}
                className={`py-4 font-bold rounded-lg transition-all transform ${focusIndex === 0 ? 'bg-blue-600 scale-105 shadow-[0_0_30px_rgba(37,99,235,0.6)]' : 'bg-zinc-800 text-gray-400'}`}
              >
                SOLO MISSION (Press A)
              </button>
              <button 
                onClick={() => { audio.init(); onOpenLobby?.(); }}
                className={`py-4 font-bold rounded-lg transition-all transform ${focusIndex === 1 ? 'bg-indigo-600 scale-105 shadow-[0_0_30px_rgba(79,70,229,0.6)]' : 'bg-zinc-800 text-gray-400'}`}
              >
                SELECT ZONE / LOBBY (Press A)
              </button>
              <p className="text-xs text-gray-600 mt-2 italic font-mono uppercase tracking-tighter">Record: {highScore?.toLocaleString()}</p>
            </div>
          </>
        )}

        {type === 'lobby' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white italic uppercase">Select Deployment Zone</h2>
              <p className="text-sm text-gray-500 font-mono">Use D-pad to select, Press A to deploy</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mapKeys.map((key, idx) => {
                const map = MAPS[key];
                const isActive = selectedMapIndex === idx;
                return (
                  <div 
                    key={key}
                    onClick={() => { audio.init(); onStart(key); }}
                    className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 transform ${isActive ? 'border-blue-500 bg-blue-500/10 scale-105 shadow-xl' : 'border-white/5 bg-black/40'}`}
                  >
                    <div className="h-20 mb-4 rounded-lg overflow-hidden flex items-center justify-center relative border border-white/5">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundColor: map.color }}></div>
                        <span className="relative font-mono text-[10px] font-bold text-white uppercase tracking-[0.2em]">{map.name}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">{map.name}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-light">{map.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 flex justify-between items-center border-t border-white/5">
              <p className="text-[10px] text-blue-500 animate-pulse font-mono uppercase tracking-widest">
                <span className="mr-2">●</span> Signal: Stable
              </p>
              <div className="flex gap-4">
                <button onClick={onMenu} className="px-8 py-3 text-sm font-bold text-gray-500 hover:text-white transition-colors uppercase">Back (B)</button>
                <button onClick={() => { audio.init(); onStart(mapKeys[selectedMapIndex]); }} className="px-12 py-3 bg-blue-600 rounded-lg text-sm font-bold shadow-lg transform hover:scale-105">DEPLOY MISSION (A)</button>
              </div>
            </div>
          </div>
        )}

        {(type === 'paused' || type === 'gameover') && (
          <>
            <h2 className={`text-6xl font-black italic tracking-tighter ${type === 'gameover' ? 'text-rose-600' : 'text-blue-500'}`}>
              {type === 'gameover' ? 'MISSION FAILED' : 'PAUSED'}
            </h2>

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => { audio.init(); onStart(); }}
                className={`py-4 font-bold rounded-lg transition-all transform ${focusIndex === 0 ? 'bg-blue-600 scale-105 shadow-[0_0_30px_rgba(37,99,235,0.4)]' : 'bg-zinc-800'}`}
              >
                {type === 'gameover' ? 'REDEPLOY (A)' : 'RESUME (A)'}
              </button>
              <button 
                onClick={onMenu}
                className={`py-4 font-bold rounded-lg transition-all transform ${focusIndex === 1 ? 'bg-zinc-700 scale-105 text-white' : 'bg-zinc-800 text-gray-500'}`}
              >
                BACK TO MENU (B)
              </button>
            </div>

            {type === 'gameover' && advice && (
              <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-2 mt-4 animate-in slide-in-from-bottom duration-700">
                <p className="text-[10px] text-blue-400 font-mono tracking-[0.3em] uppercase italic opacity-60">Tactical Uplink</p>
                <h4 className="font-bold text-blue-300 text-lg italic">"{advice.title}"</h4>
                <p className="text-sm text-gray-400 italic">"{advice.advice}"</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Menu;
