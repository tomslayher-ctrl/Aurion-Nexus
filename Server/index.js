const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http'); 
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app); 
const io = new Server(server); 
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const DB_FILE = 'database.json';

// Helper Functions
const getData = () => JSON.parse(fs.readFileSync(DB_FILE));
const saveData = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

function logAction(userId, action, target) {
    let data = getData();
    data.audit_logs.push({
        timestamp: new Date().toISOString(),
        userId, action, target
    });
    saveData(data);
}

function hasPermission(userId, permission) {
    const data = getData();
    const user = data.users[userId];
    if (!user) return false;
    const userRoles = data.roles.filter(r => user.roles.includes(r.id));
    return userRoles.some(r => r.permissions.includes(permission) || r.permissions.includes('*'));
}

// --- API ROUTES ---

app.get('/api/data', (req, res) => res.json(getData()));

// Update Profile
app.post('/api/update-profile', (req, res) => {
    const { userId, updates } = req.body;
    let data = getData();
    if (data.users[userId]) {
        data.users[userId] = { ...data.users[userId], ...updates };
        saveData(data);
        io.emit('userUpdated', { userId, user: data.users[userId] });
        res.sendStatus(200);
    } else { res.sendStatus(404); }
});

// Move Message
app.post('/api/move-message', (req, res) => {
    const { messageId, newChannelId, userId } = req.body;
    if (!hasPermission(userId, 'MANAGE_MESSAGES')) return res.sendStatus(403);

    let data = getData();
    const msgIndex = data.messages.findIndex(m => m.id == messageId);
    if (msgIndex > -1) {
        data.messages[msgIndex].channelId = newChannelId;
        saveData(data);
        logAction(userId, 'MOVE_MESSAGE', `Message ${messageId} to ${newChannelId}`);
        io.emit('refreshData');
        res.sendStatus(200);
    } else { res.sendStatus(404); }
});

io.on('connection', (socket) => {
    console.log('User connected');
});

server.listen(PORT, () => console.log(`AURION NEXUS: http://localhost:${PORT}`));