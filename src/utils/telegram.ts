
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
      last_name: tgUser.last_name || ''
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
    last_name: ''
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
