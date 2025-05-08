
import React, { useContext } from 'react';

interface GameControlsProps {
  onDirectionChange: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

const GameControls = ({ onDirectionChange }: GameControlsProps) => {
  const handleButtonClick = (direction: 'up' | 'down' | 'left' | 'right') => {
    onDirectionChange(direction);
  };

  return (
    <div className="md:hidden mt-8 z-10">
      <div className="flex justify-center mb-4">
        <button 
          className="w-16 h-16 bg-black border-2 border-primary/50 rounded-full flex items-center justify-center text-white text-2xl"
          onClick={() => handleButtonClick('up')}
        >
          ⬆
        </button>
      </div>
      
      <div className="flex justify-center items-center gap-4">
        <button 
          className="w-16 h-16 bg-black border-2 border-primary/50 rounded-full flex items-center justify-center text-white text-2xl"
          onClick={() => handleButtonClick('left')}
        >
          ⬅
        </button>
        
        <button 
          className="w-16 h-16 bg-black border-2 border-primary/50 rounded-full flex items-center justify-center text-white text-2xl"
          onClick={() => handleButtonClick('down')}
        >
          ⬇
        </button>
        
        <button 
          className="w-16 h-16 bg-black border-2 border-primary/50 rounded-full flex items-center justify-center text-white text-2xl"
          onClick={() => handleButtonClick('right')}
        >
          ➡
        </button>
      </div>
    </div>
  );
};

export default GameControls;
