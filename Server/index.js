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
const LOG_FILE = 'chat_logs.txt'; // Define your log file

const getData = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const saveData = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Permissions Check
function hasPermission(userId, permission) {
    const data = getData();
    const user = data.users[userId] || { roles: ['everyone'] };
    const userRoles = data.roles.filter(r => user.roles.includes(r.id));
    return userRoles.some(r => r.permissions.includes(permission) || r.permissions.includes('*'));
}

// API Routes
app.get('/api/data', (req, res) => res.json(getData()));

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User connected to Nexus');

    // Handle New Messages
    socket.on('sendMessage', (msgData) => {
        let data = getData();
        const timestamp = new Date().toLocaleString(); // Better for text logs
        
        const newMsg = {
            id: Date.now(),
            userId: msgData.userId,
            text: msgData.text,
            channelId: msgData.channelId,
            timestamp: new Date().toISOString()
        };

        // 1. Save to JSON Database
        data.messages.push(newMsg);
        saveData(data);

        // 2. Append to chat_logs.txt
        const logEntry = `[${timestamp}] Channel: ${msgData.channelId} | User: ${msgData.userId} | Message: ${msgData.text}\n`;
        fs.appendFileSync(path.join(__dirname, LOG_FILE), logEntry);

        // 3. Emit to all clients
        io.emit('newMessage', newMsg); 
    });

    // Handle Deletion
    socket.on('deleteMessage', ({ messageId, userId }) => {
        if (hasPermission(userId, 'MANAGE_MESSAGES')) {
            let data = getData();
            
            // Optional: Log the deletion too!
            const logEntry = `[${new Date().toLocaleString()}] ADMIN ACTION: User ${userId} deleted message ${messageId}\n`;
            fs.appendFileSync(path.join(__dirname, LOG_FILE), logEntry);

            data.messages = data.messages.filter(m => m.id != messageId);
            saveData(data);
            io.emit('messageDeleted', messageId);
        }
    });
});

server.listen(PORT, () => console.log(`AURION NEXUS ONLINE: http://localhost:${PORT}`));