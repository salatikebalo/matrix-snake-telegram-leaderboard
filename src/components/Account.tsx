
import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getUserInfo, getReferralLink, exportUsersToCSV } from '@/utils/api';
import { getTelegramUserData, sendDataToTelegramBot } from '@/utils/telegram';
import { X, Download, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AccountProps {
  isOpen: boolean;
  onClose: () => void;
}

const Account = ({ isOpen, onClose }: AccountProps) => {
  const userData = getTelegramUserData();
  const [referralLink, setReferralLink] = useState('');
  const [userStats, setUserStats] = useState({ gamesPlayed: 0, bestScore: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
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
  
  const handleExportUsers = async () => {
    setIsExporting(true);
    try {
      await exportUsersToCSV();
      toast.success('User data exported successfully');
    } catch (error) {
      toast.error('Failed to export user data');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const shareWithTelegramBot = () => {
    const dataToShare = {
      userId: userData.id,
      username: userData.username,
      firstName: userData.first_name,
      lastName: userData.last_name,
      bestScore: userStats.bestScore,
      gamesPlayed: userStats.gamesPlayed
    };
    
    sendDataToTelegramBot(dataToShare);
    toast.success('Data shared with Telegram bot');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto border border-primary/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Your Account</h2>
          {/* Removed duplicate close button */}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center mb-4">
              <Avatar className="h-16 w-16 mr-4">
                {userData.photo_url ? (
                  <AvatarImage src={userData.photo_url} alt={userData.username} />
                ) : (
                  <AvatarFallback>{userData.username?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="font-bold">{`${userData.first_name} ${userData.last_name}`.trim() || 'Guest'}</h3>
                <p className="text-sm text-muted-foreground">@{userData.username}</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">ID</label>
                <p>{userData.id}</p>
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
            
            <div className="bg-black/30 p-4 rounded-lg border border-primary/20 mb-4">
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
            
            {/* Telegram bot integration section */}
            <div className="bg-black/30 p-4 rounded-lg border border-primary/20">
              <h3 className="font-bold text-primary mb-2">Telegram Bot Integration</h3>
              <div className="flex flex-col space-y-3">
                <Button 
                  variant="outline"
                  className="flex items-center justify-center gap-2 border-primary/60 hover:bg-primary/20"
                  onClick={shareWithTelegramBot}
                >
                  <Share2 size={16} />
                  Share Stats with Bot
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex items-center justify-center gap-2 border-primary/60 hover:bg-primary/20"
                  onClick={handleExportUsers}
                  disabled={isExporting}
                >
                  <Download size={16} />
                  {isExporting ? 'Exporting...' : 'Export Users as CSV'}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Account;
