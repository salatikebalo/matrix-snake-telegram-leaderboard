
import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getLeaderboard } from '@/utils/api';
import { LeaderboardEntry } from '@/types/game';
import { getTelegramUserData } from '@/utils/telegram';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const Leaderboard = ({ isOpen, onClose }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userData = getTelegramUserData();
  
  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen]);
  
  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await getLeaderboard();
      setEntries(data);
    } catch (error) {
      console.error('Failed to load leaderboard', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/80" onClick={onClose} />
        
        <div className="z-50 bg-card p-6 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto border border-primary/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">Top Players This Week</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-primary hover:text-primary/70">
              ✕
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : entries.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No players yet this week!</p>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-12 text-sm font-semibold mb-2 px-3">
                <div className="col-span-1">#</div>
                <div className="col-span-7">Player</div>
                <div className="col-span-4 text-right">Score</div>
              </div>
              
              {entries.map((entry, index) => (
                <div 
                  key={index} 
                  className={`leaderboard-entry ${entry.userId === userData.id ? 'current-user' : ''} rounded`}
                >
                  <div className="grid grid-cols-12 w-full items-center">
                    <div className="col-span-1">{index + 1}</div>
                    <div className="col-span-7 truncate">{entry.username || 'Anonymous'}</div>
                    <div className="col-span-4 text-right">
                      {entry.score}
                      {entry.referralBonus ? (
                        <span className="text-accent ml-1 text-xs">+{entry.referralBonus}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary/20"
              onClick={loadLeaderboard}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default Leaderboard;
