
import { useState, useRef, useEffect } from 'react';
import { GameState, SnakePart, Food } from '../types/game';
import { saveUserData } from '../utils/api';

interface UseSnakeGameProps {
  onGameOver: (score: number) => void;
  soundEnabled: boolean;
}

export const useSnakeGame = ({ onGameOver, soundEnabled }: UseSnakeGameProps) => {
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
  
  // Update game state
  const updateGameState = () => {
    if (gameState.gameOver || gameState.isPaused || !gameState.gameStarted) {
      return;
    }
    
    const CANVAS_WIDTH = 400;
    const CANVAS_HEIGHT = 400;
    
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
    if (newHeadX < 0 || newHeadX >= CANVAS_WIDTH || newHeadY < 0 || newHeadY >= CANVAS_HEIGHT) {
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
        x: Math.floor(Math.random() * (CANVAS_WIDTH / 20)) * 20,
        y: Math.floor(Math.random() * (CANVAS_HEIGHT / 20)) * 20
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
  
  // Game loop with requestAnimationFrame
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

  const changeDirection = (newDirection: 'up' | 'down' | 'left' | 'right') => {
    const isValidDirectionChange = (
      (newDirection === 'left' && gameState.direction !== 'right') ||
      (newDirection === 'right' && gameState.direction !== 'left') ||
      (newDirection === 'up' && gameState.direction !== 'down') ||
      (newDirection === 'down' && gameState.direction !== 'up')
    );
    
    if (isValidDirectionChange) {
      setGameState(prev => ({ ...prev, direction: newDirection }));
      playSound('move');
      return true;
    }
    
    return false;
  };

  // Reset game on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return {
    gameState,
    startGame,
    changeDirection,
    playSound
  };
};
