import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Gender, User } from '../types';
import { AuthService, UserService } from '../services/api';
import socketService from '../services/socket';
import { useQueryClient } from '@tanstack/react-query';

interface AppContextType {
  user: UserProfile;
  isLoading: boolean;
  updateUser: (data: Partial<UserProfile>) => void;
  registerUser: (name: string, username: string, age: number, gender: Gender) => Promise<boolean>;
  refreshProfile: (force?: boolean) => Promise<void>;
  addCoins: (amount: number) => void;
  unblockUser: (userId: number) => void;
}

const defaultUser: UserProfile = {
  id: 0,
  name: '',
  username: '',
  profile_url: '',
  avatar: '',
  age: 0,
  gender: 'unspecified',
  coins: 100,
  wins: 0,
  losses: 0,
  level: 1,
  isRegistered: false,
  friends: [],
  blocked: [],
  gameRequests: [],
  history: []
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      // @ts-ignore
      let tgData = window.Telegram?.WebApp?.initData;

      if (!tgData) {
        const hash = window.location.hash.slice(1);
        const params = new URLSearchParams(hash);
        if (params.has('tgWebAppData')) {
            tgData = params.get('tgWebAppData');
        }
      }

      if (tgData) {
        try {
            const res = await AuthService.hello({ data: tgData });
            const { token, registered, parsed_user } = res.data;

            localStorage.setItem('auth_token', token);

            if (registered) {
                await refreshProfile(true); 
            } else {
                setUser(prev => ({
                    ...prev,
                    id: parsed_user.id,
                    name: parsed_user.first_name || '',
                    username: parsed_user.username || '',
                    profile_url: parsed_user.photo_url || '',
                    avatar: parsed_user.photo_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${parsed_user.id}`,
                    isRegistered: false 
                }));
            }
        } catch (e) {
            console.error("Auth Hello Failed:", e);
        }
      } else {
          const storedToken = localStorage.getItem('auth_token');
          if (storedToken) {
              try {
                  await refreshProfile(true);
              } catch (e) {
                  console.error("Token invalid:", e);
                  localStorage.removeItem('auth_token');
              }
          }
      }
      
      setIsLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    if (user.isRegistered) {
        socketService.connect();
        
        const handleUserStatus = (data: { event: string; user: User; status: string }) => {
            queryClient.invalidateQueries({ queryKey: ['friends'] });
        };

        socketService.on('user_status', handleUserStatus);
        
        return () => {
            socketService.off('user_status', handleUserStatus);
            socketService.disconnect();
        };
    }
  }, [user.isRegistered, queryClient]);

  const refreshProfile = async (force = false) => {
    try {
      const userRes = await UserService.getMe();
      const userData = userRes.data;
      const avatarUrl = userData.profile_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${userData.id}`;

      setUser(prev => ({
        ...prev,
        ...userData,
        id: userData.id,
        name: userData.name || '',
        username: userData.username || '',
        profile_url: userData.profile_url || '',
        avatar: avatarUrl,
        isRegistered: true,
        friends: [], 
        blocked: [],
      }));
      
    } catch (e) {
      console.error("Refresh Profile Failed:", e);
    }
  };

  const registerUser = async (name: string, username: string, age: number, gender: Gender) => {
    try {
      const res = await UserService.updateSettings({ name, username, age, gender });
      
      if (res.status === 200) {
        await refreshProfile(true);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const updateUser = async (data: Partial<UserProfile>) => {
    try {
        await UserService.updateSettings({
            name: data.name || undefined,
            age: data.age || undefined,
            gender: data.gender || undefined,
            username: data.username || undefined
        });
        await refreshProfile(true);
    } catch (e) {
        console.error(e);
    }
  };

  const addCoins = (amount: number) => {
    setUser(prev => ({ ...prev, coins: prev.coins + amount }));
  };

  const unblockUser = (userId: number) => {
      setUser(prev => ({...prev, blocked: prev.blocked.filter(id => id !== userId)}));
  };

  return (
    <AppContext.Provider value={{ 
        user, 
        isLoading,
        updateUser, 
        registerUser, 
        refreshProfile,
        addCoins,
        unblockUser
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
