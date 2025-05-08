
import { useEffect, useRef, useState } from 'react';

interface BackgroundMusicProps {
  soundEnabled: boolean;
}

const BackgroundMusic = ({ soundEnabled }: BackgroundMusicProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    audioRef.current = new Audio('https://raw.githubusercontent.com/salatikebalo/matrix-snake-telegram-leaderboard/main/sound/background.mp3');
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3; // Set a reasonable volume level
    }
    
    const handleUserInteraction = () => {
      if (!isInitialized && audioRef.current) {
        setIsInitialized(true);
        if (soundEnabled) {
          audioRef.current.play().catch(e => console.error('Music play error:', e));
        }
      }
    };
    
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundEnabled]);
  
  // This effect specifically handles when soundEnabled changes
  useEffect(() => {
    if (!audioRef.current || !isInitialized) return;
    
    if (soundEnabled) {
      console.log('Sound enabled - playing audio');
      audioRef.current.play().catch(e => console.error('Music play error:', e));
    } else {
      console.log('Sound disabled - pausing audio');
      audioRef.current.pause();
    }
  }, [soundEnabled, isInitialized]);
  
  return null; // This is a behavior component, no UI
};

export default BackgroundMusic;
