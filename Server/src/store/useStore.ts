import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StoreState, Message } from '../types';
import { SEED_USERS, SEED_SERVERS, SEED_CHANNELS, SEED_MESSAGES, ME_ID } from '../data/seedData';

const bc = new BroadcastChannel('nexus-sync');

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      users: SEED_USERS,
      servers: SEED_SERVERS,
      channels: SEED_CHANNELS,
      messages: SEED_MESSAGES,
      currentUser: ME_ID,
      activeServerId: 'server-1',
      activeChannelId: 'channel-1',
      typingUsers: {},

      addMessage: (msg) => {
        const id = `nexus-msg-${Date.now()}`;
        const newMessage: Message = { 
          ...msg, 
          id, 
          timestamp: Date.now() 
        };
        
        set((state) => ({
          messages: { ...state.messages, [id]: newMessage }
        }));
        
        bc.postMessage({ type: 'NEW_MESSAGE', payload: newMessage });
      },

      setActiveServer: (id) => set({ activeServerId: id }),
      setActiveChannel: (id) => set({ activeChannelId: id }),
      
      setTyping: (channelId, userId, isTyping) => set((state) => {
        const channelTypers = new Set(state.typingUsers[channelId] || []);
        if (isTyping) channelTypers.add(userId);
        else channelTypers.delete(userId);
        return { typingUsers: { ...state.typingUsers, [channelId]: Array.from(channelTypers) } };
      }),

      resetDemoData: () => set({
        users: SEED_USERS, servers: SEED_SERVERS, channels: SEED_CHANNELS, messages: SEED_MESSAGES
      })
    }),
    { name: 'aurion-nexus-v1' }
  )
);

bc.onmessage = (event) => {
  if (event.data.type === 'NEW_MESSAGE') {
    useStore.setState((state) => ({
      messages: { ...state.messages, [event.data.payload.id]: event.data.payload }
    }));
  }
};