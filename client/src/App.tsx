import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from './hooks/useSocket';

export default function App() {
  const { socket, isConnected } = useSocket();
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- OG LOGIC ---
  useEffect(() => {
    if (!socket) return;
    fetch('http://localhost:3000/api/data')
      .then(res => res.json())
      .then(data => { if (data.messages) setChatLog(data.messages); })
      .catch(err => console.error("Sync Error:", err));
    socket.on('newMessage', (msg) => { setChatLog((prev) => [...prev, msg]); });
    return () => { socket.off('newMessage'); };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;
    if (message.toLowerCase() === '/clear') {
      setChatLog([]);
      setMessage('');
      return;
    }
    socket.emit('sendMessage', { user: "Pilot", text: message, role: "User" });
    setMessage('');
  };

  // --- UI THEME ---
  const theme = {
    darkest: '#1e1f22',
    dark: '#2b2d31',
    middle: '#313338',
    light: '#383a40',
    textMain: '#dbdee1',
    textMuted: '#949ba4',
    aurionGreen: '#23a559',
    crownGold: '#f1c40f'
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: theme.middle, color: theme.textMain, overflow: 'hidden', fontFamily: '"gg sans", "Noto Sans", sans-serif' }}>
      
      {/* 1. SERVER RAIL */}
      <div style={{ width: '72px', backgroundColor: theme.darkest, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '12px', gap: '8px', flexShrink: 0 }}>
        <div style={{ width: '48px', height: '48px', backgroundColor: theme.aurionGreen, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>AU</div>
        <div style={{ width: '32px', height: '2px', backgroundColor: theme.light, borderRadius: '1px' }}></div>
      </div>

      {/* 2. SIDEBAR (Channels) */}
      <div style={{ width: '240px', backgroundColor: theme.dark, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ height: '48px', display: 'flex', alignItems: 'center', padding: '0 16px', fontWeight: 'bold', borderBottom: `1px solid ${theme.darkest}` }}>
          AURION NETWORK
        </div>
        <div style={{ flex: 1, padding: '12px 8px' }}>
          <div style={{ backgroundColor: theme.light, color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
            <span style={{ color: theme.textMuted, marginRight: '8px' }}>#</span> general-chat
          </div>
        </div>

        {/* BOTTOM USER PANEL */}
        <div style={{ padding: '8px', backgroundColor: '#232428', display: 'flex', alignItems: 'center', gap: '8px' }}>
           <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: theme.aurionGreen, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '12px' }}>
             AU
             <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', borderRadius: '50%', border: '3px solid #232428', backgroundColor: isConnected ? theme.aurionGreen : '#f23f43' }}></div>
           </div>
           <div style={{ flex: 1 }}>
             <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>Pilot</div>
             <div style={{ fontSize: '10px', color: theme.textMuted }}>{isConnected ? 'Online' : 'Offline'}</div>
           </div>
        </div>
      </div>

      {/* 3. MAIN CHAT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ height: '48px', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: `1px solid ${theme.darkest}`, fontWeight: 'bold' }}>
          <span style={{ color: theme.textMuted, marginRight: '8px' }}>#</span> general-chat
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }}>
          {chatLog.map((msg, i) => (
            <div key={i} style={{ display: 'flex', padding: '2px 16px', gap: '16px', marginTop: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: theme.aurionGreen, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', flexShrink: 0 }}>AU</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: theme.aurionGreen, fontWeight: 600 }}>{msg.user}</span>
                  <span style={{ backgroundColor: theme.aurionGreen, color: 'white', fontSize: '9px', padding: '1px 4px', borderRadius: '3px', fontWeight: 'bold' }}>PILOT</span>
                  <span style={{ color: theme.textMuted, fontSize: '12px' }}>{msg.timestamp || '7:40 PM'}</span>
                </div>
                <div style={{ marginTop: '2px' }}>{msg.text}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '0 16px 24px 16px' }}>
          <form onSubmit={handleSend} style={{ backgroundColor: theme.light, borderRadius: '8px', padding: '10px 16px' }}>
            <input 
              style={{ background: 'transparent', border: 'none', outline: 'none', color: theme.textMain, width: '100%' }}
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message #general-chat"
            />
          </form>
        </div>
      </div>

      {/* 4. MEMBER LIST (New Section) */}
      <div style={{ width: '240px', backgroundColor: theme.dark, display: 'flex', flexDirection: 'column', padding: '20px 8px', flexShrink: 0 }}>
        <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: theme.textMuted, textTransform: 'uppercase', paddingLeft: '8px', marginBottom: '8px', letterSpacing: '0.5px' }}>
          Online — 1
        </h3>
        
        {/* MEMBER ITEM */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.2s' }} 
             onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.light}
             onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
          <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: theme.aurionGreen, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '12px' }}>
            AU
            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #2b2d31', backgroundColor: theme.aurionGreen }}></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: theme.aurionGreen, fontWeight: 500, fontSize: '14px' }}>Pilot</span>
            <span title="Owner" style={{ color: theme.crownGold, fontSize: '12px' }}>👑</span>
          </div>
        </div>
      </div>

    </div>
  );
}