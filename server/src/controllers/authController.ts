import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
// import { Role } from '@prisma/client';

const registerSchema = z.object({
    phone: z.string().min(8, "Le numéro de téléphone est trop court"),
    password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
    fullName: z.string().optional(),
    nationality: z.string().optional(),
    idCardNumber: z.string().optional(),
    socialMedia: z.string().optional(),
    role: z.enum(['USER', 'ADMIN_COMPANY', 'SUPER_ADMIN']).optional(),
});

const loginSchema = z.object({
    phone: z.string(),
    password: z.string(),
});

export const register = async (req: Request, res: Response) => {
    try {
        const { phone, password, fullName, nationality, idCardNumber, socialMedia, role } = registerSchema.parse(req.body);

        // 1. Vérifier si l'utilisateur existe déjà (RAPIDE)
        const existingUser = await prisma.user.findUnique({ where: { phone } });

        if (existingUser) {
            // Mise à jour des infos KYC si fournies
            const updatedUser = await prisma.user.update({
                where: { id: existingUser.id },
                data: { fullName, nationality, idCardNumber, socialMedia }
            });
            return res.status(200).json({ message: 'Utilisateur mis à jour', userId: updatedUser.id });
        }

        // 2. Création (COUTEUX - seulement si nouveau)
        const hashedPassword = await argon2.hash(password);

        // Interdire la création de SUPER_ADMIN via l'API publique
        const finalRole = (role === 'SUPER_ADMIN') ? 'USER' : (role || 'USER');

        const user = await prisma.user.create({
            data: {
                phone,
                password: hashedPassword,
                fullName,
                nationality,
                idCardNumber,
                socialMedia,
                role: finalRole,
            },
        });

        // Générer un token pour l'auto-connexion
        const token = jwt.sign(
            { userId: user.id, role: user.role, companyId: user.companyId },
            process.env.JWT_SECRET || 'secret_super_securise',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Compte créé avec succès',
            token,
            user: {
                id: user.id,
                phone: user.phone,
                fullName: user.fullName,
                role: user.role,
                companyId: user.companyId
            }
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }

        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Ce numéro de téléphone est déjà utilisé' });
        }

        console.error('Registration error:', error);
        res.status(400).json({ error: 'Erreur lors de l\'inscription', details: error.message || error });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { phone, password } = loginSchema.parse(req.body);
        console.log(`[LOGIN ATTEMPT] Phone: ${phone}`);

        const user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
            console.log(`[LOGIN FAILED] User not found: ${phone}`);
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        const validPassword = await argon2.verify(user.password, password);
        console.log(`[LOGIN CHECK] Password valid? ${validPassword}`);

        if (!validPassword) {
            console.log(`[LOGIN FAILED] Invalid password for ${phone}`);
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role, companyId: user.companyId },
            process.env.JWT_SECRET || 'secret_super_securise',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                phone: user.phone,
                fullName: user.fullName,
                role: user.role,
                companyId: user.companyId
            }
        });
    } catch (error) {
        console.error('[LOGIN ERROR]', error);
        res.status(500).json({ error: 'Erreur de connexion' });
    }
};

/**
 * Récupérer le profil utilisateur
 */
export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                phone: true,
                fullName: true,
                nationality: true,
                idCardNumber: true,
                socialMedia: true,
                role: true
            }
        });

        if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
    }
};

/**
 * Mettre à jour le profil (KYC)
 */
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user.userId;
        const { fullName, nationality, idCardNumber, socialMedia } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                fullName,
                nationality,
                idCardNumber,
                socialMedia
            }
        });

        res.json({ message: 'Profil mis à jour avec succès', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
    }
};
// --- MOT DE PASSE OUBLIÉ ---

export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        const { phone } = req.body;
        const user = await prisma.user.findUnique({ where: { phone } });

        if (!user) {
            // Pour sécurité, on ne dit pas si l'utilisateur existe ou non
            return res.json({ message: 'Si ce numéro existe, un lien de réinitialisation a été envoyé.' });
        }

        // Token temporaire (15 min)
        const resetToken = jwt.sign(
            { userId: user.id, type: 'password_reset' },
            process.env.JWT_SECRET || 'secret_super_securise',
            { expiresIn: '15m' }
        );

        // Simulation envoi Email / SMS
        console.log(`\n🔑 [PASSWORD RESET] Link for user ${user.phone}:`);
        console.log(`http://localhost:5173/reset-password?token=${resetToken}\n`);

        res.json({ message: 'Lien de réinitialisation généré (voir console serveur).' });

    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la demande de réinitialisation' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token et nouveau mot de passe requis' });
        }

        const secret = process.env.JWT_SECRET || 'secret_super_securise';
        const decoded: any = jwt.verify(token, secret);

        if (decoded.type !== 'password_reset') {
            return res.status(400).json({ error: 'Token invalide' });
        }

        const hashedPassword = await argon2.hash(newPassword);

        await prisma.user.update({
            where: { id: decoded.userId },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.' });

    } catch (error) {
        res.status(400).json({ error: 'Lien invalide ou expiré' });
    }
};
