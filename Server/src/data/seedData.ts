import { User, Server, Channel, Message } from '../types';

export const ME_ID = 'nexus-admin';

export const SEED_USERS: Record<string, User> = {
  [ME_ID]: { id: ME_ID, username: 'ADMIN_NEXUS', avatarUrl: '', status: 'online' },
  'bot-1': { id: 'bot-1', username: 'CORE_SYSTEM', avatarUrl: '', status: 'online', isBot: true },
};

export const SEED_SERVERS: Record<string, Server> = {
  'server-1': { id: 'server-1', name: 'AURION_NEXUS', members: [ME_ID, 'bot-1'] },
};

export const SEED_CHANNELS: Record<string, Channel> = {
  'channel-1': { id: 'channel-1', serverId: 'server-1', name: 'main_frame', type: 'text' },
};

export const SEED_MESSAGES: Record<string, Message> = {
  'm1': { id: 'm1', channelId: 'channel-1', authorId: 'bot-1', content: 'AURION NEXUS INITIALIZED. SYSTEM READY.', timestamp: Date.now() },
};