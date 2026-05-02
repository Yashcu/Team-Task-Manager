import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import { env } from './lib/env.js';

const app = express();

// Middleware
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Hello route
app.get('/hello', (_, res) => {
    res.json({ message: 'hello from backend' });
});

app.use('/api/auth', authRoutes);

export default app;
