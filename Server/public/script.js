const socket = io();
let currentUser = "";
let currentRole = "everyone"; 
let activeChannel = "gen";

// --- LOGIN HANDLER ---
// We use window.onload to ensure the button is ready before we try to click it
window.onload = () => {
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username-input');
    const loginOverlay = document.getElementById('login-overlay');

    loginBtn.onclick = async () => {
        const name = usernameInput.value.trim();
        if (!name) return alert("Enter a username!");

        const res = await fetch('/api/data');
        const data = await res.json();
        
        // Exact check for Nathan_Dev
        const userInDb = data.users.find(u => u.username === name);
        
        if (userInDb) {
            currentUser = userInDb.username;
            currentRole = userInDb.role;
        } else {
            currentUser = name;
            currentRole = "everyone";
        }

        document.getElementById('display-name').innerText = currentUser;
        document.getElementById('display-role').innerText = currentRole;
        document.getElementById('user-avatar').innerText = currentUser.substring(0, 2).toUpperCase();
        
        loginOverlay.style.display = 'none';
        loadNexus();
    };
};

// --- CORE ENGINE ---
async function loadNexus() {
    if (!currentUser) return;
    const res = await fetch('/api/data');
    const data = await res.json();
    
    // 1. Render Channels & Admin "+"
    const channelContainer = document.getElementById('channel-list');
    channelContainer.innerHTML = `
        <div class="flex justify-between items-center mb-2 px-2">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Channels</p>
            ${currentRole === 'admin' ? '<button onclick="addChannel()" class="text-[#00ff41] hover:text-white">+</button>' : ''}
        </div>`;

    data.channels.forEach(ch => {
        const div = document.createElement('div');
        div.className = `px-2 py-1 rounded cursor-pointer mb-1 text-sm ${activeChannel === ch.id ? 'bg-zinc-700 text-white border-l-2 border-[#00ff41]' : 'text-gray-400 hover:bg-white/5'}`;
        div.innerText = `# ${ch.name}`;
        div.onclick = () => { activeChannel = ch.id; loadNexus(); };
        channelContainer.appendChild(div);
    });

    // 2. Render Messages
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = "";
    data.messages.filter(m => m.channelId === activeChannel).forEach(m => {
        const userObj = data.users.find(u => u.username === m.user);
        const isAdmin = userObj?.role === 'admin';
        const div = document.createElement('div');
        div.className = "flex gap-4 p-1 hover:bg-white/5 rounded";
        div.innerHTML = `
            <div class='w-10 h-10 ${isAdmin ? 'border-[#00ff41]' : 'border-white/10'} border rounded-full flex items-center justify-center font-bold text-[#00ff41] shrink-0'>${m.user[0]}</div>
            <div>
                <span class='font-bold ${isAdmin ? 'text-[#00ff41] admin-glow' : 'text-white'} text-sm'>${m.user}</span>
                <div class='text-gray-300 text-sm'>${m.text}</div>
            </div>`;
        chatBox.appendChild(div);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
}

// --- MODAL FUNCTIONS ---
function openModal(type) {
    const modal = document.getElementById('nexus-modal');
    const content = document.getElementById('modal-content');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    if (type === 'profile') {
        content.innerHTML = `<h3 class="text-[#00ff41] font-bold mb-4 uppercase text-xs">User Profile</h3>
        <p class="text-white text-sm">Name: ${currentUser}</p>
        <p class="text-[#00ff41] text-xs mb-4">Role: ${currentRole}</p>
        <button onclick="location.reload()" class="w-full bg-zinc-800 py-2 rounded text-xs hover:bg-red-500">Disconnect</button>`;
    } else {
        content.innerHTML = `<h3 class="text-[#00ff41] font-bold mb-2 uppercase text-xs">Server Details</h3>
        <p class="text-xs text-gray-400">Aurion Nexus Online<br>Version 1.0.5</p>`;
    }
}

function closeModal() {
    const modal = document.getElementById('nexus-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

async function addChannel() {
    const name = prompt("Channel Name:");
    if (!name) return;
    await fetch('/api/channels', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name: name.toLowerCase(), userRole: currentRole })
    });
    loadNexus();
}

// --- INPUTS & SOCKETS ---
document.getElementById('user-input').onkeypress = async (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
        const text = e.target.value;
        e.target.value = "";
        await fetch('/api/messages', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ text, channelId: activeChannel, user: currentUser }) });
    }
};

socket.on('newMessage', () => loadNexus());
socket.on('refreshData', () => loadNexus());