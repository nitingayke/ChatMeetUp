import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from "node:http";

dotenv.config();

import authRoute from './routes/authRoutes.js';
import insertData from './models/helperData.js';
import { connectToSocket } from './controllers/socketController.js';

const app = express();
const PORT = 8989;
const { MONGO_URL } = process.env;

const server = createServer(app);
connectToSocket(server);

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));

app.use('/user', authRoute);
app.get('/insertData', insertData);

app.get('*', (req, res) => {
    return res.send({ 'message': 'Router not found, just implemented only one router. so dont worry i will implement remaining route.' });
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
