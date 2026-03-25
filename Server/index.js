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
const LOG_FILE = path.join(__dirname, 'chat_logs.txt');

function systemLog(content) {
    const entry = `[${new Date().toLocaleString()}] ${content}\n`;
    fs.appendFileSync(LOG_FILE, entry);
}

io.on('connection', (socket) => {
    console.log('User connected to Nexus');
});

app.get('/api/data', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    res.json(data);
});

app.post('/api/messages', (req, res) => {
    const { text, channelId, user } = req.body;
    let data = JSON.parse(fs.readFileSync(DB_FILE));
    
    const msg = { 
        id: Date.now(), 
        channelId, 
        user, 
        text, 
        time: new Date().toISOString() 
    };
    
    data.messages.push(msg);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    systemLog(`CHAT [${channelId}] ${user}: ${text}`);
    
    // CRITICAL: This sends the message to the browser
    io.emit('newMessage', msg); 
    res.sendStatus(200);
});

// Admin Routes
app.post('/api/channels', (req, res) => {
    const { name, userRole } = req.body;
    if (userRole === 'admin') {
        let data = JSON.parse(fs.readFileSync(DB_FILE));
        data.channels.push({ id: Date.now().toString(), name });
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        io.emit('refreshData');
        res.sendStatus(200);
    } else { res.sendStatus(403); }
});

app.post('/api/delete-message', (req, res) => {
    const { id, userRole } = req.body;
    if (userRole === 'admin') {
        let data = JSON.parse(fs.readFileSync(DB_FILE));
        data.messages = data.messages.filter(m => m.id !== id);
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        io.emit('refreshData');
        res.sendStatus(200);
    } else { res.sendStatus(403); }
});

server.listen(PORT, () => {
    console.log(`AURION NEXUS ONLINE: http://localhost:${PORT}`);
});