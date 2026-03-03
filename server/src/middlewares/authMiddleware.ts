import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extension de l'interface Request pour inclure user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('[CRITICAL] JWT_SECRET is not defined in environment variables');
        return res.sendStatus(500);
    }

    jwt.verify(token, secret, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'SUPER_ADMIN') {
        next();
    } else {
        res.status(403).json({ error: 'Accès interdit : Super Admin uniquement' });
    }
};

export const isCompanyAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && (req.user.role === 'ADMIN_COMPANY' || req.user.role === 'SUPER_ADMIN')) {
        next();
    } else {
        res.status(403).json({ error: 'Accès interdit : Gérants uniquement' });
    }
};
