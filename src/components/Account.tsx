
import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getUserInfo, getReferralLink } from '@/utils/api';
import { getTelegramUserData } from '@/utils/telegram';

interface AccountProps {
  isOpen: boolean;
  onClose: () => void;
}

const Account = ({ isOpen, onClose }: AccountProps) => {
  const userData = getTelegramUserData();
  const [referralLink, setReferralLink] = useState('');
  const [userStats, setUserStats] = useState({ gamesPlayed: 0, bestScore: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);
  
  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const [stats, link] = await Promise.all([
        getUserInfo(),
        getReferralLink()
      ]);
      
      setUserStats(stats);
      setReferralLink(link);
    } catch (error) {
      console.error('Failed to load user data', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Link copied to clipboard');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/80" onClick={onClose} />
        
        <div className="z-50 bg-card p-6 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto border border-primary/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">Your Account</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-primary hover:text-primary/70">
              ✕
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">ID</label>
                  <p>{userData.id}</p>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Username</label>
                  <p>{userData.username}</p>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Name</label>
                  <p>{`${userData.first_name} ${userData.last_name}`.trim() || 'Guest'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Games Played</label>
                    <p>{userStats.gamesPlayed}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Best Score</label>
                    <p className="text-primary font-bold">{userStats.bestScore}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/30 p-4 rounded-lg border border-primary/20">
                <h3 className="font-bold text-primary mb-2">Referral System</h3>
                <p className="text-sm mb-4">Invite friends and get +3 bonus points for each referral!</p>
                
                <div className="flex space-x-2">
                  <Input 
                    value={referralLink} 
                    readOnly 
                    className="bg-black/50 border-primary/30 text-sm"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button 
                    className="bg-primary hover:bg-primary/80 text-white" 
                    onClick={copyReferralLink}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default Account;
