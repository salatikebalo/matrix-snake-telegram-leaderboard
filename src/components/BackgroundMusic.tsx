
import { useEffect, useRef, useState } from 'react';

interface BackgroundMusicProps {
  soundEnabled: boolean;
}

const BackgroundMusic = ({ soundEnabled }: BackgroundMusicProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    audioRef.current = new Audio('https://raw.githubusercontent.com/keysora/keysora.github.io/refs/heads/main/sounds/background.mp3');
    if (audioRef.current) {
      audioRef.current.loop = true;
    }
    
    const handleUserInteraction = () => {
      if (!isInitialized && audioRef.current && soundEnabled) {
        audioRef.current.play()
          .then(() => setIsInitialized(true))
          .catch(e => console.error('Music play error:', e));
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
  }, []);
  
  useEffect(() => {
    if (audioRef.current) {
      if (soundEnabled && isInitialized) {
        audioRef.current.play().catch(e => console.error('Music play error:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [soundEnabled, isInitialized]);
  
  return null; // This is a behavior component, no UI
};

export default BackgroundMusic;
