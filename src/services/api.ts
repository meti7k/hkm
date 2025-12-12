import axios from 'axios';

// Professional API Service Configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://api.hokmroyale.com/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor for Auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for Errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (logout user)
      localStorage.removeItem('auth_token');
      window.location.href = '/onboarding';
    }
    return Promise.reject(error);
  }
);

export const AuthService = {
  login: (data: { deviceId: string; phone?: string }) => apiClient.post('/auth/login', data),
  updateProfile: (data: any) => apiClient.put('/user/profile', data),
  getProfile: () => apiClient.get('/user/me'),
};

export const GameService = {
  findMatch: (mode: string) => apiClient.post('/game/matchmake', { mode }),
  getState: (roomId: string) => apiClient.get(`/game/${roomId}/state`),
  playCard: (roomId: string, cardId: string) => apiClient.post(`/game/${roomId}/play`, { cardId }),
  selectHokm: (roomId: string, suit: string) => apiClient.post(`/game/${roomId}/hokm`, { suit }),
};

export const SocialService = {
  getFriends: () => apiClient.get('/friends'),
  addFriend: (userId: string) => apiClient.post('/friends/request', { userId }),
  blockUser: (userId: string) => apiClient.post('/users/block', { userId }),
};

export default apiClient;
