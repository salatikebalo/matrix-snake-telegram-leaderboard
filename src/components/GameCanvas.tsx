
import { useRef, useEffect, useState } from 'react';
import { GameState } from '../types/game';
import { useIsMobile } from '../hooks/use-mobile';

interface GameCanvasProps {
  gameState: GameState;
  onClick: () => void;
}

const GameCanvas = ({ gameState, onClick }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });
  
  // Handle responsive canvas size - optimized for Telegram WebApp
  useEffect(() => {
    const updateCanvasSize = () => {
      // Check if in Telegram WebApp
      const isTelegram = Boolean((window as any).Telegram?.WebApp);
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      if (isMobile) {
        // For mobile, make sure the canvas fits comfortably
        // taking into account the Telegram app UI if present
        const maxSize = Math.min(screenWidth - 20, isTelegram ? 320 : 400);
        setCanvasSize({ width: maxSize, height: maxSize });
      } else {
        // For desktop, standard size but adapt if in Telegram
        const maxSize = isTelegram ? Math.min(400, screenWidth - 40) : 400;
        setCanvasSize({ width: maxSize, height: maxSize });
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [isMobile]);
  
  // Draw game state
  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Calculate the scaling factor
      const scaleX = canvas.width / 400;
      const scaleY = canvas.height / 400;
      
      // Draw snake
      for (let i = 0; i < gameState.snake.length; i++) {
        ctx.fillStyle = i === 0 ? '#DC143C' : '#AA0000'; // crimson for head, darker red for body
        const x = gameState.snake[i].x * scaleX;
        const y = gameState.snake[i].y * scaleY;
        const width = 20 * scaleX;
        const height = 20 * scaleY;
        
        ctx.fillRect(x, y, width, height);
        
        // Add a border to each snake part
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
      }
      
      // Draw food with glow effect
      ctx.shadowColor = '#DC143C';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#FFF';
      const foodX = gameState.food.x * scaleX;
      const foodY = gameState.food.y * scaleY;
      const foodWidth = 20 * scaleX;
      const foodHeight = 20 * scaleY;
      ctx.fillRect(foodX, foodY, foodWidth, foodHeight);
      ctx.shadowBlur = 0;
      
      // Draw score
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.fillText(`Score: ${gameState.score}`, 10, 30);
    };
    
    // Run draw function
    draw();
    
    // Set up animation frame
    const animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, canvasSize]);
  
  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      className="border-2 border-primary/50 bg-black z-10 relative rounded-md shadow-lg shadow-primary/20"
      onClick={onClick}
    />
  );
};

export default GameCanvas;
