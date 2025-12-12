import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Friend, Player, GameRequest, GameHistoryItem } from '../types';

interface AppContextType {
  user: UserProfile;
  updateUser: (data: Partial<UserProfile>) => void;
  registerUser: (name: string, age: string, gender: 'male' | 'female' | 'other') => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addFriend: (player: Player) => void;
  removeFriend: (friendId: string) => void;
  blockUser: (playerId: string) => void;
  unblockUser: (playerId: string) => void;
  isFriend: (playerId: string) => boolean;
  isBlocked: (playerId: string) => boolean;
  sendGameRequest: (friendId: string) => boolean; // Changed to return success
  acceptGameRequest: (requestId: string) => void;
  rejectGameRequest: (requestId: string) => void;
}

const defaultUser: UserProfile = {
  name: '',
  age: '',
  gender: 'male',
  avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
  coins: 50,
  wins: 0,
  losses: 0,
  level: 1,
  isRegistered: false,
  friends: [],
  blocked: [],
  gameRequests: [],
  history: [
      { id: 'h1', date: Date.now().toString(), opponentName: 'کامبیز', opponentAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Kambiz', result: 'win', score: '3 - 1', coins: 100 },
      { id: 'h2', date: (Date.now() - 86400000).toString(), opponentName: 'سارا', opponentAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sara', result: 'loss', score: '2 - 3', coins: -50 },
  ]
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('hokm_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
            ...defaultUser,
            ...parsed,
            friends: Array.isArray(parsed.friends) ? parsed.friends : [],
            blocked: Array.isArray(parsed.blocked) ? parsed.blocked : [],
            gameRequests: Array.isArray(parsed.gameRequests) ? parsed.gameRequests : [],
            history: Array.isArray(parsed.history) ? parsed.history : defaultUser.history
        };
      } catch (e) {
        console.error("Error parsing user data", e);
        return defaultUser;
      }
    }
    return defaultUser;
  });

  useEffect(() => {
    localStorage.setItem('hokm_user', JSON.stringify(user));
  }, [user]);

  // Mock incoming requests for demo
  useEffect(() => {
    if (user.isRegistered && user.gameRequests.length === 0) {
        const timer = setTimeout(() => {
            const mockRequest: GameRequest = {
                id: 'req-1',
                sender: { id: 'bot-req', name: 'کامبیز', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Kambiz', level: 5 },
                message: 'سلام، میای بازی؟',
                timestamp: Date.now()
            };
            setUser(prev => ({ ...prev, gameRequests: [...prev.gameRequests, mockRequest] }));
        }, 15000); // Delayed a bit more
        return () => clearTimeout(timer);
    }
  }, [user.isRegistered]);

  const updateUser = (data: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  const registerUser = (name: string, age: string, gender: 'male' | 'female' | 'other') => {
    setUser({
      ...defaultUser,
      name,
      age,
      gender,
      isRegistered: true,
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${name}`
    });
  };

  const addCoins = (amount: number) => {
    setUser(prev => ({ ...prev, coins: prev.coins + amount }));
  };

  const spendCoins = (amount: number) => {
    if (user.coins >= amount) {
      setUser(prev => ({ ...prev, coins: prev.coins - amount }));
      return true;
    }
    return false;
  };

  const addFriend = (player: Player) => {
    const currentFriends = user.friends || [];
    if (currentFriends.some(f => f.id === player.id)) return;
    
    const newFriend: Friend = {
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        level: Math.floor(Math.random() * 20) + 1
    };
    setUser(prev => ({ ...prev, friends: [...(prev.friends || []), newFriend] }));
  };

  const removeFriend = (friendId: string) => {
      setUser(prev => ({
          ...prev,
          friends: prev.friends.filter(f => f.id !== friendId)
      }));
  };

  const blockUser = (playerId: string) => {
    const currentBlocked = user.blocked || [];
    if (currentBlocked.includes(playerId)) return;
    
    setUser(prev => ({
        ...prev,
        blocked: [...(prev.blocked || []), playerId],
        friends: (prev.friends || []).filter(f => f.id !== playerId)
    }));
  };

  const unblockUser = (playerId: string) => {
    setUser(prev => ({
        ...prev,
        blocked: (prev.blocked || []).filter(id => id !== playerId)
    }));
  };

  const isFriend = (playerId: string) => user.friends?.some(f => f.id === playerId) ?? false;
  const isBlocked = (playerId: string) => user.blocked?.includes(playerId) ?? false;

  const sendGameRequest = (friendId: string) => {
      // Mock sending request
      console.log("Sending request to", friendId);
      return true;
  };

  const acceptGameRequest = (requestId: string) => {
      setUser(prev => ({
          ...prev,
          gameRequests: prev.gameRequests.filter(r => r.id !== requestId)
      }));
  };

  const rejectGameRequest = (requestId: string) => {
      setUser(prev => ({
          ...prev,
          gameRequests: prev.gameRequests.filter(r => r.id !== requestId)
      }));
  };

  return (
    <AppContext.Provider value={{ 
        user, 
        updateUser, 
        registerUser, 
        addCoins, 
        spendCoins,
        addFriend,
        removeFriend,
        blockUser,
        unblockUser,
        isFriend,
        isBlocked,
        sendGameRequest,
        acceptGameRequest,
        rejectGameRequest
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
