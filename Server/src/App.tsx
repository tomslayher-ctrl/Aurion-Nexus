import React from 'react';
import { ServerSidebar } from './components/layout/ServerSidebar';
import { ChannelSidebar } from './components/layout/ChannelSidebar';
import { MemberSidebar } from './components/layout/MemberSidebar';
import { ChatArea } from './components/chat/ChatArea';

export default function App() {
  return (
    <div className="flex h-screen w-full bg-[#0D0208] text-[#00FF41] overflow-hidden font-mono selection:bg-[#00FF41] selection:text-black">
      {/* Sidebar: Server Icons */}
      <div className="border-r border-[#003B00]">
        <ServerSidebar />
      </div>
      
      {/* Sidebar: Nexus Channels */}
      <div className="border-r border-[#003B00]">
        <ChannelSidebar />
      </div>
      
      {/* Main Chat: Nexus Feed */}
      <div className="flex-1">
        <ChatArea />
      </div>
      
      {/* Right: Member List */}
      <div className="border-l border-[#003B00]">
        <MemberSidebar />
      </div>
    </div>
  );
}