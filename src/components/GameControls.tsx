
import React from 'react';
import { useIsMobile } from '../hooks/use-mobile';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

interface GameControlsProps {
  onDirectionChange: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

const GameControls = ({ onDirectionChange }: GameControlsProps) => {
  const isMobile = useIsMobile();
  
  const handleButtonClick = (direction: 'up' | 'down' | 'left' | 'right') => {
    onDirectionChange(direction);
  };

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-10 px-4">
      <div className="flex justify-center mb-4">
        <button 
          className="w-16 h-16 bg-black/80 border-2 border-primary/50 rounded-full flex items-center justify-center text-white"
          onClick={() => handleButtonClick('up')}
          aria-label="Move Up"
        >
          <ArrowUp size={24} />
        </button>
      </div>
      
      <div className="flex justify-center items-center gap-4">
        <button 
          className="w-16 h-16 bg-black/80 border-2 border-primary/50 rounded-full flex items-center justify-center text-white"
          onClick={() => handleButtonClick('left')}
          aria-label="Move Left"
        >
          <ArrowLeft size={24} />
        </button>
        
        <button 
          className="w-16 h-16 bg-black/80 border-2 border-primary/50 rounded-full flex items-center justify-center text-white"
          onClick={() => handleButtonClick('down')}
          aria-label="Move Down"
        >
          <ArrowDown size={24} />
        </button>
        
        <button 
          className="w-16 h-16 bg-black/80 border-2 border-primary/50 rounded-full flex items-center justify-center text-white"
          onClick={() => handleButtonClick('right')}
          aria-label="Move Right"
        >
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default GameControls;
