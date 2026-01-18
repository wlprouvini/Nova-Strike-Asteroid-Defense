
import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import Menu from './components/Menu';
import { GameState, GameStatus, PilotAdvice } from './types';
import { getPilotAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>({
    score: 0,
    level: 1,
    highScore: parseInt(localStorage.getItem('highScore') || '0'),
    state: GameState.MENU
  });

  const [advice, setAdvice] = useState<PilotAdvice | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  const startGame = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      score: 0,
      level: 1,
      state: GameState.PLAYING
    }));
    setAdvice(null);
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setStatus(prev => {
      const newHighScore = Math.max(prev.highScore, finalScore);
      localStorage.setItem('highScore', newHighScore.toString());
      return {
        ...prev,
        score: finalScore,
        highScore: newHighScore,
        state: GameState.GAMEOVER
      };
    });

    setIsLoadingAdvice(true);
    getPilotAdvice(finalScore, status.level).then(res => {
      setAdvice(res);
      setIsLoadingAdvice(false);
    });
  }, [status.level]);

  const togglePause = useCallback(() => {
    setStatus(prev => {
      // Só permite pausar se estiver jogando ou já pausado
      if (prev.state !== GameState.PLAYING && prev.state !== GameState.PAUSED) return prev;
      return {
        ...prev,
        state: prev.state === GameState.PLAYING ? GameState.PAUSED : GameState.PLAYING
      };
    });
  }, []);

  const backToMenu = useCallback(() => {
    setStatus(prev => ({ ...prev, state: GameState.MENU }));
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
         <div className="stars-small"></div>
         <div className="stars-medium"></div>
         <div className="stars-large"></div>
      </div>

      <GameCanvas 
        gameState={status.state} 
        onGameOver={handleGameOver}
        onLevelUp={(lvl) => setStatus(s => ({ ...s, level: lvl }))}
        onScoreUpdate={(pts) => setStatus(s => ({ ...s, score: s.score + pts }))}
        onTogglePause={togglePause}
      />

      <HUD 
        status={status} 
        onPause={togglePause} 
      />

      {status.state === GameState.MENU && (
        <Menu 
          type="start" 
          highScore={status.highScore} 
          onStart={startGame} 
        />
      )}

      {status.state === GameState.GAMEOVER && (
        <Menu 
          type="gameover" 
          score={status.score}
          highScore={status.highScore}
          advice={advice}
          isLoadingAdvice={isLoadingAdvice}
          onStart={startGame}
          onMenu={backToMenu}
        />
      )}

      {status.state === GameState.PAUSED && (
        <Menu 
          type="paused" 
          onStart={togglePause} 
          onMenu={backToMenu}
        />
      )}

      <div className="fixed bottom-4 left-4 text-[10px] text-gray-500 font-mono hidden md:block">
        WASD/ARROWS: MOVE | SPACE: FIRE | P: PAUSE | CONTROLLER SUPPORTED
      </div>
    </div>
  );
};

export default App;
