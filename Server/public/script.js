const socket = io();
let currentUser = null;
let currentChannelId = '1';

// --- 1. THE LOGIN FUNCTION ---
async function login() {
    const usernameInput = document.getElementById('username-input');
    const val = usernameInput.value.trim();
    
    if (!val) return alert("Enter a name, King.");

    try {
        const response = await fetch('/api/data');
        const data = await response.json();

        // Check if user exists in your database.json
        const userEntry = Object.entries(data.users).find(([id, info]) => 
            info.username.toLowerCase() === val.toLowerCase()
        );

        if (userEntry) {
            const [userId, userInfo] = userEntry;
            currentUser = { id: userId, ...userInfo };
        } else {
            // Guest login if not in database
            currentUser = { 
                id: val.toLowerCase().replace(/\s/g, '_'), 
                username: val, 
                displayName: val, 
                roles: ['everyone'] 
            };
        }

        // Hide login and show app
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('display-name').innerText = currentUser.displayName;
        document.getElementById('display-role').innerText = currentUser.roles[0];
        
        loadApp();
    } catch (err) {
        console.error("Login failed:", err);
        alert("Server error - check your terminal!");
    }
}

// --- 2. THE UI & CHAT LOGIC ---
function toggleServerMenu() {
    const menu = document.getElementById('server-dropdown');
    if (menu) menu.classList.toggle('hidden');
}

async function loadApp() {
    const res = await fetch('/api/data');
    const data = await res.json();
    
    // Channels
    const chanContainer = document.getElementById('channel-list');
    if (chanContainer) {
        chanContainer.innerHTML = data.channels.map(ch => `
            <div class="p-2 rounded cursor-pointer mb-0.5 hover:bg-white/5 transition-colors ${ch.id === currentChannelId ? 'bg-white/10 text-white font-medium' : 'text-gray-400'}" 
                 onclick="switchChannel('${ch.id}')"># ${ch.name}</div>
        `).join('');
    }

    // Messages
    const msgContainer = document.getElementById('chat-box');
    if (msgContainer) {
        const filtered = data.messages.filter(m => m.channelId === currentChannelId);
        msgContainer.innerHTML = filtered.map(m => {
            const isAdmin = m.userId === 'admin' || m.userId.toLowerCase() === 'nathan_dev';
            const nameClass = isAdmin ? 'admin-glow' : 'text-white font-bold';
            return `<div class="flex flex-col msg-anim">
                        <span class="text-xs ${nameClass}">${m.userId}</span>
                        <span class="text-[15px] text-[#dbdee1]">${m.text}</span>
                    </div>`;
        }).join('');
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }
}

function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text || !currentUser) return;

    socket.emit('sendMessage', {
        userId: currentUser.id,
        text: text,
        channelId: currentChannelId
    });
    input.value = '';
}

function switchChannel(id) {
    currentChannelId = id;
    loadApp();
}

socket.on('newMessage', () => loadApp());

// Handle Enter Key
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        // If login is visible, login. Else, send message.
        const loginVisible = !document.getElementById('login-overlay').classList.contains('hidden');
        if (loginVisible) {
            login();
        } else {
            sendMessage();
        }
    }
});