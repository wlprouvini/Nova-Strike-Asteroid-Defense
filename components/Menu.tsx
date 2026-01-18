
import React from 'react';
import { PilotAdvice } from '../types';

interface MenuProps {
  type: 'start' | 'paused' | 'gameover';
  onStart: () => void;
  onMenu?: () => void;
  score?: number;
  highScore?: number;
  advice?: PilotAdvice | null;
  isLoadingAdvice?: boolean;
}

const Menu: React.FC<MenuProps> = ({ 
  type, onStart, onMenu, score, highScore, advice, isLoadingAdvice 
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900/80 border border-white/10 shadow-2xl text-center space-y-8">
        
        {type === 'start' && (
          <>
            <div className="space-y-2">
              <h1 className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-600">
                NOVA STRIKE
              </h1>
              <p className="text-sm font-mono text-gray-500 tracking-[0.2em] uppercase">
                Asteroid Defense Initiative
              </p>
            </div>
            
            <div className="py-4 space-y-4">
              <button 
                onClick={onStart}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all transform hover:scale-105 active:scale-95"
              >
                ENGAGE THRUSTERS
              </button>
              <p className="text-xs text-gray-600">High Score: {highScore?.toLocaleString()}</p>
            </div>
          </>
        )}

        {type === 'paused' && (
          <>
            <h2 className="text-4xl font-black text-gray-200">SYSTEMS STANDBY</h2>
            <div className="flex flex-col gap-4">
              <button 
                onClick={onStart}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all"
              >
                RESUME MISSION
              </button>
              <button 
                onClick={onMenu}
                className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-bold rounded-lg transition-all"
              >
                ABORT TO HQ
              </button>
            </div>
          </>
        )}

        {type === 'gameover' && (
          <>
            <div className="space-y-1">
              <h2 className="text-5xl font-black text-rose-600">HULL BREACH</h2>
              <p className="text-sm font-mono text-rose-400 uppercase">Pilot Neutralized</p>
            </div>

            <div className="bg-black/40 p-6 rounded-xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-mono uppercase">Final Score</span>
                <span className="text-2xl font-bold text-white">{score?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-mono uppercase">Personal Best</span>
                <span className="text-gray-300 font-bold">{highScore?.toLocaleString()}</span>
              </div>
            </div>

            <div className="min-h-[100px] flex flex-col items-center justify-center p-4 border border-blue-500/20 rounded-xl bg-blue-500/5">
              {isLoadingAdvice ? (
                <div className="flex items-center gap-2 text-blue-400/60 animate-pulse text-sm font-mono">
                   <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                   ANALYZING FLIGHT DATA...
                </div>
              ) : advice ? (
                <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-500">
                  <div className="text-[10px] text-blue-500 font-mono uppercase tracking-widest flex items-center justify-center gap-2">
                    <span className="w-10 h-[1px] bg-blue-500/30"></span>
                    Gemini Intelligence Link
                    <span className="w-10 h-[1px] bg-blue-500/30"></span>
                  </div>
                  <h3 className="text-lg font-bold text-blue-400 leading-tight">"{advice.title}"</h3>
                  <p className="text-sm text-gray-400 italic">"{advice.advice}"</p>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <button 
                onClick={onStart}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all transform hover:scale-105"
              >
                REDEPLOY
              </button>
              <button 
                onClick={onMenu}
                className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-bold rounded-lg transition-all"
              >
                RETURN TO HQ
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Menu;
