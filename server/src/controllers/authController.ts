import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    className: z.string().optional(), // Pour les élèves
});

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, className } = registerSchema.parse(req.body);

        const hashedPassword = await argon2.hash(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                className,
            },
        });

        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error: any) {
        console.error('Registration error:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }

        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email already exists' });
        }

        res.status(400).json({ error: 'Registration failed', details: error.message || error });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await argon2.verify(user.password, password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'secretkeywords',
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                className: user.className
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};
