import axios, { AxiosError } from 'axios';
import { 
  HelloRequest, 
  HelloResponse, 
  UserUpdateRequest,
  FriendListResponse,
  BlockedUsersListResponse,
  GameListResponse,
  CreateGameRequest,
  PackageListResponse,
  UserSearchResponse,
  ActionFriendResponse,
  ActionUserResponse,
  ActionGameResponse,
  BlockActionResponse,
  GameInfo
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://test.ichatgeram.com';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    const isHelloEndpoint = config.url?.endsWith('/auth/hello');

    if (token && !isHelloEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export const AuthService = {
  hello: (data: HelloRequest) => 
    apiClient.post<HelloResponse>('/auth/hello', data),
};

export const UserService = {
  getMe: () => apiClient.get('/user/me'),
  
  updateSettings: (data: UserUpdateRequest) => 
    apiClient.patch<ActionUserResponse>('/user/settings', data),
    
  updateAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.put<ActionUserResponse>('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  search: (username: string) => 
    apiClient.get<UserSearchResponse>('/user/search', { params: { username, limit: 20 } }),
};

export const GameService = {
  list: (limit = 20, offset = 0, min_bet?: number, max_bet?: number) => 
    apiClient.get<GameListResponse>('/game/list', { params: { limit, offset, min_bet, max_bet } }),
    
  create: (data: CreateGameRequest) => 
    apiClient.post<ActionGameResponse>('/game/create', data),
    
  join: (gameId: number) => 
    apiClient.post<ActionGameResponse>(`/game/${gameId}/join`),
    
  changeSeat: (gameId: number, seat: number) => 
    apiClient.patch<ActionGameResponse>(`/game/${gameId}/change-seat`, { seat }),
    
  transferLeader: (gameId: number, leaderId: number) => 
    apiClient.patch<ActionGameResponse>(`/game/${gameId}/transfer-leader`, { id: leaderId }),
    
  getGame: (gameId: number) =>
    apiClient.get<GameInfo>(`/game/${gameId}`),
};

export const StoreService = {
  listPackages: (limit = 20, offset = 0) => 
    apiClient.get<PackageListResponse>('/packages/', { params: { limit, offset } }),
};

export const SocialService = {
  // Fetch friends list (filter: 'friends' | 'incoming' | 'outgoing')
  getFriends: (limit = 20, offset = 0, filter?: 'friends' | 'incoming' | 'outgoing') => 
    apiClient.get<FriendListResponse>('/friend/list', { params: { limit, offset, filter } }),
    
  // Send friend request (requires User ID)
  sendRequest: (userId: number) => 
    apiClient.post<ActionFriendResponse>('/friend/add', { user_id: userId }),
    
  // Accept friend request (requires Friendship ID)
  acceptRequest: (friendshipId: number) => 
    apiClient.post<ActionFriendResponse>(`/friend/${friendshipId}/accept`),
    
  // Reject friend request (requires Friendship ID)
  rejectRequest: (friendshipId: number) => 
    apiClient.delete<ActionFriendResponse>(`/friend/${friendshipId}/reject`),
    
  // Remove friend (requires User ID of the friend)
  removeFriend: (userId: number) => 
    apiClient.delete<ActionFriendResponse>(`/friend/${userId}/remove`),
    
  getBlocked: (limit = 20, offset = 0) => 
    apiClient.get<BlockedUsersListResponse>('/block/list', { params: { limit, offset } }),
    
  blockUser: (userId: number) => 
    apiClient.post<BlockActionResponse>('/block/add', { user_id: userId }),
    
  unblockUser: (userId: number) => 
    apiClient.delete<BlockActionResponse>(`/block/${userId}/remove`),
};

export default apiClient;
