import express from 'express'
import http from 'http';
import { Server } from 'socket.io';
import socketController from './controllers/socketController.js';
import videoApp  from './controllers/videocall.js'

const app = express();
const PORT = 8989;

const server = http.createServer(app); 
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET','POST']
    }
})

app.get('*', (req, res) => {
    return res.send({ 'message': 'Router not found, just implemented only one router. so dont worry i will implement remaining route.'})
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socketController(io, socket);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    })
})

app.get('/video', (req,res) => {
    res.send(videoApp)
})

const startServer = () => {

    app.listen(PORT, () => {
        console.log(`App has been listening on port: ${PORT}`);
    });
}

startServer();