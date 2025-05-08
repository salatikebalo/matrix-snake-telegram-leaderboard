
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import MatrixBackground from '@/components/MatrixBackground';
import SnakeGame from '@/components/SnakeGame';
import Leaderboard from '@/components/Leaderboard';
import Account from '@/components/Account';
import BackgroundMusic from '@/components/BackgroundMusic';
import { saveUserProfile, processReferral } from '@/utils/api';
import { expandTelegramApp } from '@/utils/telegram';

const Index = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  
  // Check for referral code
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('ref')) {
      const referralCode = urlParams.get('ref');
      if (referralCode) {
        localStorage.setItem('last_referral', referralCode);
        processReferral(referralCode).catch(console.error);
        toast.success('Referral bonus activated!');
      }
    }
    
    // Initialize Telegram WebApp
    expandTelegramApp();
    
    // Save user profile data
    saveUserProfile().catch(console.error);
  }, []);
  
  const handleGameOver = (score: number) => {
    setLastScore(score);
    toast.error(`Game Over! Your score: ${score}`);
    
    // Show the main button in Telegram WebApp if available
    if ((window as any).Telegram?.WebApp?.MainButton) {
      (window as any).Telegram.WebApp.MainButton.show();
    }
  };
  
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    toast.info(soundEnabled ? 'Sound disabled' : 'Sound enabled');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden">
      <MatrixBackground />
      <BackgroundMusic soundEnabled={soundEnabled} />
      
      <div 
        className="sound-button absolute top-4 right-4"
        onClick={toggleSound}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </div>
      
      <header className="mt-6 mb-4 relative z-10">
        <h1 className="text-4xl font-bold text-primary">Matrix Snake</h1>
      </header>
      
      <main className="flex flex-col items-center flex-grow z-10">
        <SnakeGame onGameOver={handleGameOver} soundEnabled={soundEnabled} />
        
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Button 
            onClick={() => setShowAccount(true)}
            className="bg-primary hover:bg-primary/80 text-white"
          >
            Account
          </Button>
          
          <Button 
            onClick={() => setShowLeaderboard(true)}
            className="bg-primary hover:bg-primary/80 text-white"
          >
            Top Players This Week
          </Button>
        </div>
      </main>
      
      <Account isOpen={showAccount} onClose={() => setShowAccount(false)} />
      <Leaderboard isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
    </div>
  );
};

export default Index;
