import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { socket } from '../../lib/socket'; 
import { Send, Hash, Cpu } from 'lucide-react';

export const ChatArea = () => {
  const { activeChannelId, channels, messages, currentUser, addMessage } = useStore();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const channel = activeChannelId ? channels[activeChannelId] : null;
  const channelMessages = Object.values(messages)
    .filter((m) => m.channelId === activeChannelId);

  useEffect(() => {
    // MATCHING THE OG BACKEND: Listening for 'newMessage'
    socket.on('newMessage', (msg) => {
      addMessage(msg);
    });

    return () => { socket.off('newMessage'); };
  }, [addMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !activeChannelId) return;

    // MATCHING THE OG BACKEND: Sending 'userId', 'text', and 'role'
    const messagePayload = {
      channelId: activeChannelId,
      userId: currentUser, 
      text: draft.trim(),
      role: 'admin' // You can change this based on your user role
    };

    socket.emit('sendMessage', messagePayload);
    setDraft('');
  };

  if (!channel) return <div className="flex-1 bg-nexus-black text-nexus-green p-10 font-mono">[ UPLINK_REQUIRED ]</div>;

  return (
    <div className="flex-1 flex flex-col bg-nexus-black border-x border-nexus-dark h-full font-mono">
      <div className="h-12 border-b border-nexus-dark flex items-center px-4 bg-nexus-black/90 shadow-nexus-glow">
        <Hash size={18} className="text-nexus-green mr-2" />
        <span className="font-bold text-nexus-green uppercase tracking-widest">{channel.name}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-nexus">
        {channelMessages.map((msg: any) => (
          <div key={msg.id} className="group border-l-2 border-transparent hover:border-nexus-green pl-4 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-nexus-green font-bold text-xs">USER_{msg.userId?.slice(0,4)}</span>
              <span className="text-[10px] text-nexus-dark">[{new Date(msg.timestamp).toLocaleTimeString()}]</span>
            </div>
            <p className="text-nexus-dim text-sm tracking-tight">
              <span className="text-nexus-dark mr-2">{">"}</span>{msg.text}
            </p>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-nexus-black border-t border-nexus-dark">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full bg-nexus-black border border-nexus-dark text-nexus-green pl-4 pr-12 py-3 focus:outline-none focus:border-nexus-green"
            placeholder="EXECUTE_COMMAND..."
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-nexus-dark hover:text-nexus-green">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};