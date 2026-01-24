
import React, { useState, useEffect } from 'react';
import { GameStatus } from '../types';
import { audio } from '../services/audioService';

interface HUDProps {
  status: GameStatus;
  onPause: () => void;
}

const HUD: React.FC<HUDProps> = ({ status, onPause }) => {
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const checkGamepad = () => {
      const gps = navigator.getGamepads();
      setGamepadConnected(!!gps[0]);
    };
    window.addEventListener("gamepadconnected", checkGamepad);
    window.addEventListener("gamepaddisconnected", checkGamepad);
    checkGamepad();
    return () => {
      window.removeEventListener("gamepadconnected", checkGamepad);
      window.removeEventListener("gamepaddisconnected", checkGamepad);
    };
  }, []);

  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

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
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/></svg>
              GP READY
            </span>
          )}
        </div>
        <div className="text-sm font-mono text-gray-500">
          Level {status.level}
        </div>
      </div>

      <div className="flex flex-col items-end space-y-3 pointer-events-auto">
        <div className="flex gap-2">
          <button 
            onClick={handleToggleMute}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors backdrop-blur-sm"
          >
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" x2="17" y1="9" y2="15"/><line x1="17" x2="23" y1="9" y2="15"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            )}
          </button>
          <button 
            onClick={onPause}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors backdrop-blur-sm"
          >
            {status.state === 'PAUSED' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/></svg>
            )}
          </button>
        </div>
        <div className="text-right">
          <div className="text-xs font-mono text-gray-500 uppercase">High Score</div>
          <div className="text-sm font-bold text-gray-300">{status.highScore.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
