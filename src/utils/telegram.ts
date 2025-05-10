
import { UserData } from "../types/game";

const generateUserId = (): string => {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
};

export const getTelegramUserData = (): UserData => {
  if ((window as any).Telegram?.WebApp?.initDataUnsafe?.user) {
    const tgUser = (window as any).Telegram.WebApp.initDataUnsafe.user;
    return {
      id: tgUser.id,
      username: tgUser.username || 'Anonymous',
      first_name: tgUser.first_name || 'Guest',
      last_name: tgUser.last_name || '',
      photo_url: tgUser.photo_url || null
    };
  }
  
  // If no Telegram data, use localStorage or generate a new ID
  const storedId = localStorage.getItem('snake_user_id');
  const userId = storedId || generateUserId();
  
  if (!storedId) {
    localStorage.setItem('snake_user_id', userId);
  }
  
  return {
    id: userId,
    username: localStorage.getItem('snake_user_username') || 'Guest' + userId.substring(0, 4),
    first_name: 'Guest',
    last_name: '',
    photo_url: null
  };
};

export const expandTelegramApp = (): void => {
  if ((window as any).Telegram?.WebApp) {
    (window as any).Telegram.WebApp.expand();
    (window as any).Telegram.WebApp.MainButton
      .setText('Play Again')
      .onClick(() => {
        document.dispatchEvent(new CustomEvent('tgPlayAgain'));
      })
      .show();
  }
};

export const sendDataToTelegramBot = (data: any): void => {
  if ((window as any).Telegram?.WebApp) {
    try {
      // This will send the data back to the Telegram Bot
      (window as any).Telegram.WebApp.sendData(JSON.stringify(data));
    } catch (error) {
      console.error("Error sending data to Telegram bot:", error);
    }
  }
};

export const closeTelegramWebApp = (): void => {
  if ((window as any).Telegram?.WebApp) {
    (window as any).Telegram.WebApp.close();
  }
};

// Function to export user data as CSV
export const exportUsersAsCSV = (users: UserData[]): string => {
  const csvHeader = "id,username,first_name,last_name,photo_url,best_score,games_played\n";
  
  const csvContent = users.map(user => {
    return [
      user.id,
      user.username?.replace(/,/g, ' ') || 'Anonymous',
      user.first_name?.replace(/,/g, ' ') || '',
      user.last_name?.replace(/,/g, ' ') || '',
      user.photo_url || '',
      user.bestScore || 0,
      user.gamesPlayed || 0
    ].join(',');
  }).join('\n');
  
  return csvHeader + csvContent;
};

// Function to download CSV data
export const downloadCSV = (csvContent: string, filename = 'telegram_users.csv'): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

