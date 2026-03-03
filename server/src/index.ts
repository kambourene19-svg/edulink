import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

import rateLimit from 'express-rate-limit';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// --- SÉCURITÉ : RATE LIMITING ---
// Limiteur global (100 requêtes par 15 min par IP)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Trop de requêtes, réessayez dans 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiteur strict pour l'Auth (5 tentatives par 15 min)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Trop de tentatives de connexion, compte bloqué temporairement.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(globalLimiter); // Appliquer partout par défaut

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://192.168.11.117:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'http://192.168.11.117:4173',
];

if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
    origin: function (origin, callback) {
        // Important : avec credentials: true, origin ne peut pas être "*"
        // Si allowedOrigins contient "*" ou l'origine réelle, on renvoie true (echo de l'origine)
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked for origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Global Query/Request Logger for Debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
import authRoutes from './routes/authRoutes';
import bookingRoutes from './routes/bookingRoutes';
import companyRoutes from './routes/companyRoutes';
import statsRoutes from './routes/statsRoutes';
import paymentRoutes from './routes/paymentRoutes';

app.use('/api/auth', authLimiter, authRoutes); // Plus strict pour l'auth
app.use('/api/bookings', bookingRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'OK', database: 'Connected', service: 'FasoTicket API' });
    } catch (error) {
        res.status(500).json({ status: 'Error', database: 'Disconnected', error: String(error) });
    }
});

app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API FasoTicket' });
});

// Start server
const start = async () => {
    try {
        await prisma.$connect();
        console.log('Database connection successful');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    }
};

start();
