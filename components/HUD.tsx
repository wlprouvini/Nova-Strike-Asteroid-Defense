
import React, { useState, useEffect } from 'react';
import { GameStatus } from '../types';

interface HUDProps {
  status: GameStatus;
  onPause: () => void;
}

const HUD: React.FC<HUDProps> = ({ status, onPause }) => {
  const [gamepadConnected, setGamepadConnected] = useState(false);

  useEffect(() => {
    const checkGamepad = () => {
      const gps = navigator.getGamepads();
      setGamepadConnected(!!gps[0]);
    };
    
    window.addEventListener("gamepadconnected", checkGamepad);
    window.addEventListener("gamepaddisconnected", checkGamepad);
    
    // Check initially
    checkGamepad();

    return () => {
      window.removeEventListener("gamepadconnected", checkGamepad);
      window.removeEventListener("gamepaddisconnected", checkGamepad);
    };
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none">
      <div className="space-y-1">
        <div className="text-4xl font-bold tracking-tighter text-blue-500 drop-shadow-lg">
          {status.score.toLocaleString()}
        </div>
        <div className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
          Score
          {gamepadConnected && (
            <span className="flex items-center gap-1 text-green-500 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gamepad-2"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>
              GP READY
            </span>
          )}
        </div>
        <div className="text-sm font-mono text-gray-500">
          Level {status.level}
        </div>
      </div>

      <div className="flex flex-col items-end space-y-2 pointer-events-auto">
        <button 
          onClick={onPause}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors backdrop-blur-sm"
        >
          {status.state === 'PAUSED' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pause"><rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/></svg>
          )}
        </button>
        <div className="text-right">
          <div className="text-xs font-mono text-gray-500 uppercase">High Score</div>
          <div className="text-sm font-bold text-gray-300">{status.highScore.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
