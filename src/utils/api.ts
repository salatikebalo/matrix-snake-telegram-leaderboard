
import { UserData, LeaderboardEntry } from "../types/game";
import { getTelegramUserData } from "./telegram";

// Backend API URL - replace with your actual backend URL
const API_URL = 'http://149.28.78.75';

export async function saveUserData(score: number): Promise<void> {
  const userData = getTelegramUserData();
  try {
    const response = await fetch(`${API_URL}/api/save-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegramId: userData.id,
        score: score
      })
    });
    
    await response.json();
    return;
  } catch (error) {
    console.error('Save error:', error);
    // Fallback to localStorage
    const savedData = JSON.parse(localStorage.getItem(`snake_user_${userData.id}`) || '{}');
    const gamesPlayed = (savedData.gamesPlayed || 0) + 1;
    const bestScore = Math.max(score, savedData.bestScore || 0);
    localStorage.setItem(`snake_user_${userData.id}`, JSON.stringify({
      gamesPlayed,
      bestScore
    }));
  }
}

export async function getUserInfo(): Promise<{gamesPlayed: number, bestScore: number}> {
  const userData = getTelegramUserData();
  
  try {
    const response = await fetch(`${API_URL}/api/user?id=${userData.id}`);
    const data = await response.json();
    if (data) {
      return {
        gamesPlayed: data.gamesPlayed || 0,
        bestScore: data.bestScore || 0
      };
    }
  } catch (error) {
    console.error('Load user error:', error);
    // Fallback to localStorage
    const savedData = JSON.parse(localStorage.getItem(`snake_user_${userData.id}`) || '{"gamesPlayed":0,"bestScore":0}');
    return {
      gamesPlayed: savedData.gamesPlayed || 0,
      bestScore: savedData.bestScore || 0
    };
  }
  
  return { gamesPlayed: 0, bestScore: 0 };
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(`${API_URL}/api/leaderboard`);
    return await response.json();
  } catch (error) {
    console.error('Load leaderboard error:', error);
    return [];
  }
}

export async function saveUserProfile(): Promise<void> {
  const userData = getTelegramUserData();
  try {
    await fetch(`${API_URL}/api/save-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegramId: userData.id,
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name
      })
    });
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

export async function getReferralLink(): Promise<string> {
  const userData = getTelegramUserData();
  try {
    const response = await fetch(`${API_URL}/api/referral/${userData.id}`);
    const data = await response.json();
    return data.link || window.location.origin + '?ref=' + userData.id;
  } catch (error) {
    console.error('Referral error:', error);
    return window.location.origin + '?ref=' + userData.id;
  }
}

export async function processReferral(referrerId: string): Promise<void> {
  const userData = getTelegramUserData();
  try {
    await fetch(`${API_URL}/api/referral`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrerCode: referrerId,
        newUserId: userData.id
      })
    });
  } catch (error) {
    console.error('Error processing referral:', error);
  }
}
