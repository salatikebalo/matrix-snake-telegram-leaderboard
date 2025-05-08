
import { useEffect } from 'react';
import { useSnakeGame } from '../hooks/useSnakeGame';
import GameCanvas from './GameCanvas';
import GameControls from './GameControls';
import { useIsMobile } from '../hooks/use-mobile';

interface SnakeGameProps {
  onGameOver: (score: number) => void;
  soundEnabled: boolean;
}

const SnakeGame = ({ onGameOver, soundEnabled }: SnakeGameProps) => {
  const { gameState, startGame, changeDirection } = useSnakeGame({ 
    onGameOver: (score) => {
      // Only trigger game over popup when the game is actually over
      if (gameState.gameOver) {
        onGameOver(score);
      }
    }, 
    soundEnabled 
  });
  
  const isMobile = useIsMobile();
  
  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.gameStarted || gameState.gameOver) {
        startGame();
        return;
      }
      
      switch (e.key) {
        case 'ArrowLeft':
          changeDirection('left');
          break;
        case 'ArrowRight':
          changeDirection('right');
          break;
        case 'ArrowUp':
          changeDirection('up');
          break;
        case 'ArrowDown':
          changeDirection('down');
          break;
        // Removed space bar case to prevent pausing
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState.direction, gameState.gameStarted, gameState.gameOver]);
  
  // Handle mobile controls
  const handleMobileControl = (dir: 'up' | 'down' | 'left' | 'right') => {
    if (!gameState.gameStarted || gameState.gameOver) {
      startGame();
      return;
    }
    
    changeDirection(dir);
  };
  
  // Telegram play again event
  useEffect(() => {
    const handleTgPlayAgain = () => startGame();
    document.addEventListener('tgPlayAgain', handleTgPlayAgain);
    
    return () => {
      document.removeEventListener('tgPlayAgain', handleTgPlayAgain);
    };
  }, []);
  
  // Handler for canvas click to restart game
  const handleCanvasClick = () => {
    if (gameState.gameOver || !gameState.gameStarted) {
      startGame();
    }
  };
  
  return (
    <div className="relative">
      <div className="relative flex flex-col items-center">
        <div className="absolute top-4 left-4 z-10 px-2 py-1 bg-black/50 rounded-md border border-primary">
          Score: {gameState.score}
        </div>
        
        {gameState.gameOver && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/70">
            <div className="text-4xl font-bold text-primary animate-pulse">GAME OVER</div>
          </div>
        )}
        
        {!gameState.gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-xl text-primary">
              {isMobile ? "Tap to start" : "Press any key to start"}
            </div>
          </div>
        )}
        
        <GameCanvas gameState={gameState} onClick={handleCanvasClick} />
        <GameControls onDirectionChange={handleMobileControl} />
      </div>
    </div>
  );
};

export default SnakeGame;
