export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  isBot?: boolean;
}

export interface Message {
  id: string;
  channelId: string;
  authorId: string;
  content: string;
  timestamp: number;
}

export interface Channel {
  id: string;
  serverId: string;
  name: string;
  type: 'text' | 'voice';
}

export interface Server {
  id: string;
  name: string;
  members: string[];
}

export interface StoreState {
  users: Record<string, User>;
  servers: Record<string, Server>;
  channels: Record<string, Channel>;
  messages: Record<string, Message>;
  currentUser: string;
  activeServerId: string;
  activeChannelId: string;
  typingUsers: Record<string, string[]>;
  addMessage: (msg: { channelId: string; authorId: string; content: string }) => void;
  setActiveServer: (id: string) => void;
  setActiveChannel: (id: string) => void;
  setTyping: (channelId: string, userId: string, isTyping: boolean) => void;
  resetDemoData: () => void;
}