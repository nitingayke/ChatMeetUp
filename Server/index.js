import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from "node:http";

dotenv.config();

import authRoute from './routes/authRoutes.js';
import userRoute from './routes/userRoute.js';
import chatRoute from './routes/chatRoutes.js';
import userChat from './routes/userChatRoutes.js';
import statusRoute from './routes/statusRoutes.js';
import groupRoute from './routes/groupRoutes.js';

import { connectToSocket } from './controllers/socketController.js';

const app = express();
const PORT = 8989;
const { MONGO_URL } = process.env;

const server = createServer(app);
connectToSocket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));


app.use('/user', authRoute);

app.use('/user-update', userRoute);

app.use('/group', groupRoute);

app.use("/chatRoute", chatRoute);

app.use("/chat-user", userChat);

app.use("/status", statusRoute);

app.get('*', (req, res) => {
    return res.send({ 'message': 'Router not found' });
});

app.use((err, req, res, next) => {
    return res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

const startServer = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('MongoDB is connected.');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }

    server.listen(PORT, () => {
        console.log(`App has been listening on port: ${PORT}`);
    });
};

startServer();
