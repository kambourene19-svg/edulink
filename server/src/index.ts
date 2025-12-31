import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || '*', // Allow all for now or specific client URL
    credentials: true
}));
app.use(express.json());

// Routes
import authRoutes from './routes/authRoutes';
import documentRoutes from './routes/documentRoutes';

app.use('/auth', authRoutes);
app.use('/api/documents', documentRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API EduLink' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
