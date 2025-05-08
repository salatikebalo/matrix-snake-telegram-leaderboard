
import { useRef, useEffect } from 'react';
import { GameState } from '../types/game';

interface GameCanvasProps {
  gameState: GameState;
  onClick: () => void;
}

const GameCanvas = ({ gameState, onClick }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
    
    // Run draw function
    draw();
    
    // Set up animation frame
    const animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [gameState]);
  
  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="border-2 border-primary/50 bg-black z-10 relative rounded-md shadow-lg shadow-primary/20"
      onClick={onClick}
    />
  );
};

export default GameCanvas;
