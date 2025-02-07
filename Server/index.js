
import express from 'express'
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import socketController from './controllers/socketController.js';
import authRoute from './routes/authRoutes.js'
import insertData from './models/helperData.js';

const app = express();
const PORT = 8989;

app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));


dotenv.config();
const { MONGO_URL } = process.env;


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

app.use('/user', authRoute);

app.get('/insertData', insertData);


app.get('*', (req, res) => {
    return res.send({ 'message': 'Router not found, just implemented only one router. so dont worry i will implement remaining route.' })
});

app.use((err, req, res, next) => {
    return res.status(err.status || 500).json({
        success: false, 
        message: err.message || 'Internal Server Error',
    })
})

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socketController(io, socket);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    })
});


const startServer = async () => {

    try {
        await mongoose.connect(MONGO_URL);
        console.log('MongoDB is connected.');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
    app.listen(PORT, () => {
        console.log(`App has been listening on port: ${PORT}`);
    });
}

startServer();