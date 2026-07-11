import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import config from './config/config.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import messageRouter from './routes/message.routes.js';
import notificationRouter from './routes/notification.routes.js';
import documentRouter from './routes/document.routes.js';
import { getIO } from './services/socket.service.js';

const app = express();

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
if (config.FRONTEND_URL) {
    const urls = config.FRONTEND_URL.split(',').map(url => url.trim());
    allowedOrigins.push(...urls);
}

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Inject socket.io to req object
app.use((req, res, next) => {
    try {
        req.io = getIO();
    } catch (e) {
        // Socket.io not initialized
    }
    next();
});

// Serve static public folder (for uploaded avatars and project images)
app.use(express.static('public'));

// Define routes
app.get('/', (req, res) => {
    res.send('Welcome to the Business Nexus.');
});

// Auth routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/message', messageRouter);
app.use('/api/notification', notificationRouter);
app.use('/api/document', documentRouter);
export default app;