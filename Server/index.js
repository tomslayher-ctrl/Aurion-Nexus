import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import cors from 'cors';

const app = express();
app.use(cors({ origin: "http://localhost:5173", methods: ["GET", "POST", "DELETE"] }));
app.use(express.json());

const server = createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:5173" } });

const DB_PATH = './database.json';
const getDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const saveDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// This stays in memory so it clears if the server restarts
let onlineUsers = {}; 

app.get('/api/data', (req, res) => {
    const data = getDB();
    res.json({ ...data, onlineUsers }); 
});

app.delete('/api/messages/:id', (req, res) => {
    const targetId = req.params.id;
    let dbData = getDB();
    dbData.messages = dbData.messages.filter(m => String(m.id) !== String(targetId));
    saveDB(dbData);
    io.emit('dataUpdated');
    res.sendStatus(200);
});

io.on('connection', (socket) => {
    // When a user logs in, we link their Socket ID to their Name
    socket.on('userLogin', (userData) => {
        onlineUsers[socket.id] = userData;
        io.emit('presenceUpdate', onlineUsers);
    });

    socket.on('sendMessage', (msg) => {
        let dbData = getDB();
        const newMsg = { ...msg, id: Date.now().toString() };
        dbData.messages.push(newMsg);
        saveDB(dbData);
        io.emit('newMessage', newMsg);
    });

    socket.on('disconnect', () => {
        delete onlineUsers[socket.id];
        io.emit('presenceUpdate', onlineUsers);
    });
});

server.listen(3000, () => {
    console.log("AURION NEXUS ONLINE (3000)");
});