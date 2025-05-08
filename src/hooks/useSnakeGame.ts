
import { useState, useRef, useEffect } from 'react';
import { GameState, SnakePart, Food } from '../types/game';
import { saveUserData } from '../utils/api';
import { controlBeepSound, eatSound, gameOverSound } from '../utils/sounds';

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
  const lastDirectionRef = useRef<string>(gameState.direction);
  
  // Sound effects using the imported sound utility
  const soundEffects = {
    eat: new Audio(eatSound),
    gameOver: new Audio(gameOverSound),
    move: new Audio(controlBeepSound)
  };
  
  // Adjust volume for the sounds
  useEffect(() => {
    if (soundEffects.eat) {
      soundEffects.eat.volume = 0.3; // Reduce eat sound volume
    }
    if (soundEffects.move) {
      soundEffects.move.volume = 0.1; // Very quiet control beep
    }
  }, []);

  // Handle game loop
  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver || gameState.isPaused) return;
    
    const updateGame = () => {
      const head = { ...gameState.snake[0] };
      const food = { ...gameState.food };
      
      // Update head position based on direction
      switch (gameState.direction) {
        case 'right':
          head.x += 20;
          break;
        case 'left':
          head.x -= 20;
          break;
        case 'up':
          head.y -= 20;
          break;
        case 'down':
          head.y += 20;
          break;
      }
      
      // Check if food is eaten
      const eatsFood = head.x === food.x && head.y === food.y;
      
      // Check for collisions with walls or self
      const hitsWall = head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400;
      const hitsSelf = gameState.snake.some(part => part.x === head.x && part.y === head.y);
      
      if (hitsWall || hitsSelf) {
        // Game over
        if (soundEnabled) soundEffects.gameOver.play().catch(err => console.log('Audio error:', err));
        setGameState(prev => ({ ...prev, gameOver: true }));
        onGameOver(gameState.score);
        return;
      }
      
      // Update snake position
      const newSnake = [head, ...gameState.snake];
      if (!eatsFood) {
        newSnake.pop(); // Remove tail if not eating food
      } else {
        // Play eat sound and generate new food
        if (soundEnabled) soundEffects.eat.play().catch(err => console.log('Audio error:', err));
        food.x = Math.floor(Math.random() * 20) * 20;
        food.y = Math.floor(Math.random() * 20) * 20;
      }
      
      // Update game state
      setGameState(prev => ({
        ...prev,
        snake: newSnake,
        food: food,
        score: eatsFood ? prev.score + 1 : prev.score
      }));
      
      // Update last direction
      lastDirectionRef.current = gameState.direction;
    };
    
    // Set up game loop
    const gameLoop = () => {
      updateGame();
      requestRef.current = requestAnimationFrame(gameLoop);
    };
    
    // Start game loop with proper timing - faster speed now
    const timerId = setTimeout(() => {
      requestRef.current = requestAnimationFrame(gameLoop);
    }, 100); // Increased snake speed (was 150)
    
    return () => {
      // Clean up
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      clearTimeout(timerId);
    };
  }, [gameState, onGameOver, soundEnabled]);
  
  // Start game function
  const startGame = () => {
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
    
    lastDirectionRef.current = 'right';
  };
  
  // Change direction function
  const changeDirection = (newDirection: "up" | "down" | "left" | "right") => {
    // Prevent 180 degree turns
    if (
      (newDirection === 'right' && lastDirectionRef.current === 'left') ||
      (newDirection === 'left' && lastDirectionRef.current === 'right') ||
      (newDirection === 'up' && lastDirectionRef.current === 'down') ||
      (newDirection === 'down' && lastDirectionRef.current === 'up')
    ) {
      return;
    }
    
    // No sound for direction changes
    setGameState(prev => ({ ...prev, direction: newDirection }));
  };
  
  return { gameState, startGame, changeDirection };
};
