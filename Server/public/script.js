const socket = io("http://localhost:3000"); 
let currentUser = null;
let currentChannelId = "1";
let allData = { channels: [], messages: [], onlineUsers: {} };

// --- SYSTEM CLOCK ---
setInterval(() => {
    const clock = document.getElementById("system-clock");
    if (clock) {
        const now = new Date();
        clock.innerText = now.toTimeString().split(' ')[0];
    }
}, 1000);

window.login = async function() {
    const val = document.getElementById("username-input").value.trim();
    if (!val) return;
    const isKing = val.toLowerCase() === "nathan_dev" || val.toLowerCase() === "admin";
    currentUser = { username: val, displayName: isKing ? "King" : val, role: isKing ? "admin" : "everyone" };
    
    document.getElementById("display-name").innerText = currentUser.displayName;
    document.getElementById("display-role").innerText = isKing ? "KING" : "USER";
    
    if(isKing) {
        document.getElementById("display-role").classList.add("text-king-glow");
    }

    socket.emit('userLogin', currentUser);
    document.getElementById("login-overlay").style.display = "none";
    await loadApp();
};

async function loadApp() {
    const res = await fetch("http://localhost:3000/api/data");
    allData = await res.json();
    renderChannels();
    renderMessages();
    renderMembers();
}

function renderChannels() {
    const list = document.getElementById("channel-list");
    list.innerHTML = allData.channels.map(ch => `
        <div onclick="window.changeChannel('${ch.id}', '${ch.name}')" 
             class="p-2 px-3 rounded-md cursor-pointer transition-all flex items-center gap-2 ${currentChannelId === ch.id ? 'bg-[#404249] text-white font-bold' : 'text-gray-400 hover:bg-[#35373c]'}">
            <span class="text-gray-500 font-normal text-xl">#</span> ${ch.name}
        </div>
    `).join('');
}

window.changeChannel = (id, name) => {
    currentChannelId = id;
    const header = document.getElementById("channel-header");
    header.style.opacity = "0.5";
    setTimeout(() => {
        header.innerText = `# ${name}`;
        header.style.opacity = "1";
    }, 100);
    renderChannels();
    renderMessages();
};

function renderMessages() {
    const box = document.getElementById("chat-box");
    if (!box) return;
    box.innerHTML = "";
    let lastUserId = null;

    allData.messages.filter(m => m.channelId === currentChannelId).forEach(m => {
        const isKing = m.userId === "King";
        const isAdmin = currentUser?.role === "admin";
        const isSameUser = (m.userId === lastUserId);
        lastUserId = m.userId;

        const div = document.createElement("div");
        div.className = `flex gap-4 group relative items-start message-animate ${isSameUser ? 'message-grouped' : 'mt-4'}`;
        
        div.innerHTML = `
            ${!isSameUser ? `
                <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 font-black border border-white/10 shrink-0">AU</div>
            ` : ''}
            <div class="flex-1">
                ${!isSameUser ? `
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-black tracking-tight ${isKing ? 'text-king-glow' : 'text-white'}">${m.userId}</span>
                        <span class="text-[9px] text-gray-600 uppercase font-bold tracking-widest opacity-40">Verified Link</span>
                    </div>
                ` : ''}
                <p class="text-[#dcddde] text-sm mt-0.5 leading-relaxed font-medium">${m.text}</p>
            </div>
            ${isAdmin ? `<button onclick="window.deleteMsg('${m.id}')" class="hidden group-hover:block text-red-500 text-[9px] font-black cursor-pointer bg-black/60 px-2 py-1 rounded border border-red-900/50 absolute right-0">DELETE</button>` : ''}
        `;
        box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
}

function renderMembers() {
    const list = document.getElementById("member-list");
    const count = document.getElementById("online-count");
    const users = Object.values(allData.onlineUsers || {});
    if (count) count.innerText = users.length;
    if (!list) return;

    list.innerHTML = users.map(user => `
        <div class="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer transition-all">
            <div class="relative">
                <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold border ${user.displayName === 'King' ? 'border-[#00ff41] text-[#00ff41]' : 'border-white/20 text-white'}">AU</div>
                <div class="absolute bottom-0 right-0 status-online border-2 border-[#2b2d31]"></div>
            </div>
            <span class="text-xs font-bold ${user.displayName === 'King' ? 'text-[#00ff41]' : 'text-gray-400'}">${user.displayName}</span>
        </div>
    `).join('');
}

// --- SETTINGS LOGIC ---
window.openSettings = () => {
    const modal = document.getElementById("settings-modal");
    if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        document.getElementById("new-display-name").value = currentUser.displayName;
        document.getElementById("user-status-input").value = currentUser.status || "";
    }
};

window.closeSettings = () => {
    const modal = document.getElementById("settings-modal");
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
};

window.saveProfile = () => {
    const nameInput = document.getElementById("new-display-name");
    const statusInput = document.getElementById("user-status-input");
    
    if (nameInput && nameInput.value.trim()) {
        currentUser.displayName = nameInput.value.trim();
        currentUser.status = statusInput.value.trim();
        document.getElementById("display-name").innerText = currentUser.displayName;
        socket.emit('userLogin', currentUser);
        window.closeSettings();
    }
};

// --- EVENTS ---
document.getElementById("login-btn")?.addEventListener("click", window.login);
document.getElementById("settings-btn")?.addEventListener("click", window.openSettings);

document.addEventListener("keypress", (e) => {
    const input = document.getElementById("user-input");
    if(e.key === "Enter" && document.activeElement === input && input.value.trim()) {
        socket.emit("sendMessage", { userId: currentUser.displayName, text: input.value, channelId: currentChannelId });
        input.value = "";
    }
});

socket.on("newMessage", (msg) => { 
    allData.messages.push(msg); 
    if(msg.channelId === currentChannelId) renderMessages(); 
});
socket.on("presenceUpdate", (users) => { allData.onlineUsers = users; renderMembers(); });