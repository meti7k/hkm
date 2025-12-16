import { GameState, User } from '../types';

type EventHandler = (data: any) => void;

interface UserStatusEvent {
    event: "user_status";
    user: User;
    status: "online" | "offline";
    context: {
        scope: "room" | "friends";
        room_id?: number;
    };
}

interface NewFriendEvent {
    event: "friend_request";
    user: User;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string = 'wss://test.ichatgeram.com/ws';
  private listeners: Record<string, EventHandler[]> = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isConnected = false;
  private reconnectTimer: any = null;

  constructor() {}

  connect() {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
        console.warn('Socket: No token found, skipping connection.');
        return;
    }
    
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsUrl = `${this.url}?token=${token}`;
    console.log('Socket: Connecting...');

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket Connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      
      this.emit('connected', {});
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Handle User Status Events explicitly
        if (message.event === 'user_status') {
            this.emit('user_status', message as UserStatusEvent);
            return;
        }

        // Handle Friend Request Events
        if (message.event === 'friend_request') {
            this.emit('friend_request', message as NewFriendEvent);
            return;
        }

        if (message.type) {
          this.emit(message.type, message.payload || message);
        } else if (message.event) {
             // Fallback for other event-based messages
             this.emit(message.event, message);
        } else {
            console.log('Socket received raw:', message);
        }
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    };

    this.socket.onclose = (event) => {
      console.log(`WebSocket Disconnected (Code: ${event.code})`);
      this.isConnected = false;
      this.socket = null;
      this.emit('disconnected', {});
      
      if (event.code !== 1000 && event.code !== 4001) { 
          this.handleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error', error);
    };
  }

  disconnect() {
      if (this.socket) {
          this.socket.close(1000, 'User initiated disconnect');
          this.socket = null;
      }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
      this.reconnectAttempts++;
      console.log(`Socket: Reconnecting in ${delay}ms (Attempt ${this.reconnectAttempts})`);
      this.reconnectTimer = setTimeout(() => this.connect(), delay);
    }
  }

  send(type: string, payload: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, ...payload }));
    } else {
      console.warn('WebSocket not connected, queuing message or dropping:', type);
    }
  }

  on(event: string, callback: EventHandler) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: EventHandler) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  // --- Game Specific Methods ---
  joinGame(mode: 'online' | 'friends', targetScore: number) {
    this.send('GAME_JOIN', { mode, targetScore });
  }

  playCard(cardId: string) {
    this.send('GAME_PLAY', { cardId });
  }
  
  startGame(gameId: number) {
      this.send('GAME_START', { gameId });
  }

  watchGame(gameId: number) {
      this.send('GAME_WATCH', { gameId });
  }

  sendEmoji(emoji: string) {
    this.send('GAME_EMOJI', { emoji });
  }

  sendChat(recipientId: string, text: string) {
    this.send('CHAT_SEND', { recipientId, text });
  }
}

export const socketService = new WebSocketService();
export default socketService;
