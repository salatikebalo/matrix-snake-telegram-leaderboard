
import { useEffect, useRef } from 'react';

const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas to full window size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    const columns = Math.floor(canvas.width / 10);
    const drops: number[] = Array(columns).fill(1);
    
    const draw = () => {
      // Slightly higher opacity for better visibility (0.05 -> 0.03)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#DC143C'; // crimson
      ctx.font = '10px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(0x30A0 + Math.random() * 96);
        ctx.fillText(text, i * 10, drops[i] * 10);
        
        if (drops[i] * 10 > canvas.height && Math.random() > 0.997) {
          drops[i] = 0;
        }
        
        drops[i] += 0.5;
      }
    };
    
    // Faster interval for better animation
    const interval = setInterval(draw, 33);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 pointer-events-none z-0 w-full h-full"
    />
  );
};

export default MatrixBackground;
