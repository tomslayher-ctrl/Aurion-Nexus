const socket = io();
let currentUser = null;
let currentChannelId = '1';

// --- 1. LOGIN SYSTEM ---
async function login() {
    const usernameInput = document.getElementById('username-input').value.trim();
    if (!usernameInput) return alert("Please enter a username");

    try {
        const response = await fetch('/api/data');
        const data = await response.json();

        // Find user by ID or Username
        const userEntry = Object.entries(data.users).find(([id, info]) => 
            id.toLowerCase() === usernameInput.toLowerCase() || 
            info.username.toLowerCase() === usernameInput.toLowerCase()
        );

        if (userEntry) {
            const [userId, userInfo] = userEntry;
            currentUser = { id: userId, ...userInfo };
        } else {
            // New user / Guest login
            currentUser = {
                id: usernameInput.toLowerCase().replace(/\s/g, '_'),
                username: usernameInput,
                displayName: usernameInput,
                roles: ['everyone']
            };
        }

        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('display-name').innerText = currentUser.displayName || currentUser.username;
        
        loadApp(); // Initialize the dashboard
    } catch (err) {
        console.error("Login failed:", err);
    }
}

// --- 2. DATA LOADING & RENDERING ---
async function loadApp() {
    const res = await fetch('/api/data');
    const data = await res.json();
    
    renderChannels(data.channels);
    renderMessages(data.messages);
}

function renderChannels(channels) {
    const container = document.getElementById('channel-list');
    container.innerHTML = channels.map(ch => `
        <div class="channel-item ${ch.id === currentChannelId ? 'active' : ''}" 
             onclick="switchChannel('${ch.id}')">
            # ${ch.name}
        </div>
    `).join('');
}

function renderMessages(messages) {
    const container = document.getElementById('message-container');
    const filtered = messages.filter(m => m.channelId === currentChannelId);
    
    container.innerHTML = filtered.map(m => `
        <div class="message-card" data-id="${m.id}">
            <span class="user-bold">${m.userId}:</span>
            <span class="text-content">${m.text}</span>
        </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
}

// --- 3. PROFILE & MODALS ---
function toggleModal(id, show) {
    const modal = document.getElementById(id);
    if (!modal) return;
    show ? modal.classList.remove('hidden') : modal.classList.add('hidden');
}

async function saveProfileChanges() {
    const newName = document.getElementById('settings-display-name').value;
    const status = document.getElementById('settings-status').value;

    const res = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: currentUser.id,
            updates: { displayName: newName, customStatus: status }
        })
    });

    if (res.ok) {
        toggleModal('profile-modal', false);
        loadApp(); // Refresh to see changes
    }
}

// --- 4. CONTEXT MENU (Right Click) ---
window.addEventListener('contextmenu', (e) => {
    const msg = e.target.closest('.message-card');
    const menu = document.getElementById('context-menu');
    
    if (msg && menu) {
        e.preventDefault();
        menu.style.top = `${e.pageY}px`;
        menu.style.left = `${e.pageX}px`;
        menu.classList.remove('hidden');
        menu.dataset.selectedMsgId = msg.dataset.id;
    }
});

window.addEventListener('click', () => {
    const menu = document.getElementById('context-menu');
    if (menu) menu.classList.add('hidden');
});

// --- 5. MESSAGE ACTIONS ---
async function moveSelectedMessage(targetChannelId) {
    const messageId = document.getElementById('context-menu').dataset.selectedMsgId;