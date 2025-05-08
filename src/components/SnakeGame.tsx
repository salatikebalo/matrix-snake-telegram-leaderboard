
import { useEffect, useRef, useState } from 'react';
import { GameState, SnakePart, Food } from '../types/game';
import { saveUserData } from '../utils/api';

interface SnakeGameProps {
  onGameOver: (score: number) => void;
  soundEnabled: boolean;
}

const SnakeGame = ({ onGameOver, soundEnabled }: SnakeGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 9 * 20, y: 10 * 20 }],
    food: {
      x: Math.floor(Math.random() * 20) * 20,
      y: Math.floor(Math.random() * 20) * 20
    },
    direction: 'right',
    score: 0,
    gameOver: false,
    gameStarted: false,
    isPaused: false
  });
  
  const gameLoopRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);
  
  // Sound effects
  const soundEffects = {
    eat: new Audio('https://raw.githubusercontent.com/keysora/keysora.github.io/refs/heads/main/sounds/eat.mp3'),
    gameOver: new Audio('https://raw.githubusercontent.com/keysora/keysora.github.io/main/sounds/game-over.mp3'),
    move: new Audio('https://raw.githubusercontent.com/keysora/keysora.github.io/main/sounds/move.mp3')
  };
  
  const playSound = (sound: 'eat' | 'gameOver' | 'move') => {
    if (soundEnabled && soundEffects[sound]) {
      soundEffects[sound].currentTime = 0;
      soundEffects[sound].play().catch(e => console.log(`Sound play error:`, e));
    }
  };

  const startGame = () => {
    if (gameState.gameOver || !gameState.gameStarted) {
      setGameState({
        snake: [{ x: 9 * 20, y: 10 * 20 }],
        food: {
          x: Math.floor(Math.random() * 20) * 20,
          y: Math.floor(Math.random() * 20) * 20
        },
        direction: 'right',
        score: 0,
        gameOver: false,
        gameStarted: true,
        isPaused: false
      });
      
      // Ensure any existing animation frame is canceled
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    } else {
      setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    }
  };
  
  const endGame = () => {
    // Cancel animation frame directly
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    
    playSound('gameOver');
    setGameState(prev => ({ ...prev, gameOver: true }));
    saveUserData(gameState.score).catch(console.error);
    onGameOver(gameState.score);
  };
  
  // Draw game state
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    for (let i = 0; i < gameState.snake.length; i++) {
      ctx.fillStyle = i === 0 ? '#DC143C' : '#AA0000'; // crimson for head, darker red for body
      ctx.fillRect(gameState.snake[i].x, gameState.snake[i].y, 20, 20);
      
      // Add a border to each snake part
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      ctx.strokeRect(gameState.snake[i].x, gameState.snake[i].y, 20, 20);
    }
    
    // Draw food with glow effect
    ctx.shadowColor = '#DC143C';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(gameState.food.x, gameState.food.y, 20, 20);
    ctx.shadowBlur = 0;
    
    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${gameState.score}`, 10, 30);
  };
  
  // Game loop with requestAnimationFrame for smoother animation
  const updateGameState = () => {
    if (gameState.gameOver || gameState.isPaused || !gameState.gameStarted) {
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Move snake
    const headX = gameState.snake[0].x;
    const headY = gameState.snake[0].y;
    
    let newHeadX = headX;
    let newHeadY = headY;
    
    switch (gameState.direction) {
      case 'left': newHeadX -= 20; break;
      case 'right': newHeadX += 20; break;
      case 'up': newHeadY -= 20; break;
      case 'down': newHeadY += 20; break;
    }
    
    // Check wall collision
    if (newHeadX < 0 || newHeadX >= canvas.width || newHeadY < 0 || newHeadY >= canvas.height) {
      endGame();
      return;
    }
    
    // Check self collision
    for (let i = 0; i < gameState.snake.length; i++) {
      if (newHeadX === gameState.snake[i].x && newHeadY === gameState.snake[i].y) {
        endGame();
        return;
      }
    }
    
    // Check food collision
    let newSnake = [...gameState.snake];
    let newFood = { ...gameState.food };
    let newScore = gameState.score;
    
    if (newHeadX === gameState.food.x && newHeadY === gameState.food.y) {
      playSound('eat');
      
      newFood = {
        x: Math.floor(Math.random() * (canvas.width / 20)) * 20,
        y: Math.floor(Math.random() * (canvas.height / 20)) * 20
      };
      
      newScore += 3;
    } else {
      newSnake.pop();
    }
    
    // Add new head
    newSnake.unshift({ x: newHeadX, y: newHeadY });
    
    setGameState(prev => ({
      ...prev,
      snake: newSnake,
      food: newFood,
      score: newScore
    }));
  };
  
  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.gameStarted || gameState.gameOver) {
        startGame();
        return;
      }
      
      switch (e.key) {
        case 'ArrowLeft':
          if (gameState.direction !== 'right') {
            setGameState(prev => ({ ...prev, direction: 'left' }));
            playSound('move');
          }
          break;
        case 'ArrowRight':
          if (gameState.direction !== 'left') {
            setGameState(prev => ({ ...prev, direction: 'right' }));
            playSound('move');
          }
          break;
        case 'ArrowUp':
          if (gameState.direction !== 'down') {
            setGameState(prev => ({ ...prev, direction: 'up' }));
            playSound('move');
          }
          break;
        case 'ArrowDown':
          if (gameState.direction !== 'up') {
            setGameState(prev => ({ ...prev, direction: 'down' }));
            playSound('move');
          }
          break;
        case ' ':
          setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState.direction, gameState.gameStarted, gameState.isPaused, soundEnabled, gameState.gameOver]);
  
  // Handle mobile controls
  const handleMobileControl = (dir: 'up' | 'down' | 'left' | 'right') => {
    if (!gameState.gameStarted || gameState.gameOver) {
      startGame();
      return;
    }
    
    if (
      (dir === 'left' && gameState.direction !== 'right') ||
      (dir === 'right' && gameState.direction !== 'left') ||
      (dir === 'up' && gameState.direction !== 'down') ||
      (dir === 'down' && gameState.direction !== 'up')
    ) {
      setGameState(prev => ({ ...prev, direction: dir }));
      playSound('move');
    }
  };
  
  // Game loop with fixed time steps for consistent gameplay
  useEffect(() => {
    let lastTime = 0;
    const gameSpeed = 100; // ms per step
    
    const gameLoop = (timestamp: number) => {
      // Calculate time difference
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;
      
      // Update game state at fixed intervals
      if (elapsed >= gameSpeed) {
        lastTime = timestamp;
        updateGameState();
      }
      
      // Draw every frame for smooth visuals
      draw();
      
      // Continue the loop
      if (!gameState.gameOver) {
        requestRef.current = requestAnimationFrame(gameLoop);
      }
    };
    
    if (gameState.gameStarted && !gameState.isPaused && !gameState.gameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameState]);
  
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
            <div className="text-xl text-primary">Press any key or tap the screen to start</div>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="border-2 border-primary/50 bg-black z-10 relative rounded-md shadow-lg shadow-primary/20"
          onClick={handleCanvasClick}
        />
        
        <div className="md:hidden mt-8 z-10">
          <div className="flex justify-center mb-4">
            <button 
              className="w-16 h-16 bg-black border-2 border-primary/50 rounded-full flex items-center justify-center text-white text-2xl"
              onClick={() => handleMobileControl('up')}
            >
              ⬆
            </button>
          </div>
          
          <div className="flex justify-center items-center gap-4">
            <button 
              className="w-16 h-16 bg-black border-2 border-primary/50 rounded-full flex items-center justify-center text-white text-2xl"
              onClick={() => handleMobileControl('left')}
            >
              ⬅
            </button>
            
            <button 
              className="w-16 h-16 bg-black border-2 border-primary/50 rounded-full flex items-center justify-center text-white text-2xl"
              onClick={() => handleMobileControl('down')}
            >
              ⬇
            </button>
            
            <button 
              className="w-16 h-16 bg-black border-2 border-primary/50 rounded-full flex items-center justify-center text-white text-2xl"
              onClick={() => handleMobileControl('right')}
            >
              ➡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
