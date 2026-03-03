import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { MailService } from '../services/mailService';
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
// --- MOT DE PASSE OUBLIÉ (Style Google avec OTP) ---

/**
 * 1. Demander la réinitialisation (Envoi du code par Email)
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ error: "L'adresse email est requise." });

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Sécurité : ne pas confirmer l'existence de l'email
            return res.json({ message: 'Si cet email existe, un code de vérification a été envoyé.' });
        }

        // Générer un code à 6 chiffres
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Stocker en base
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetCode: otpCode,
                resetCodeExpires: expires
            }
        });

        // Envoyer l'email
        const previewUrl = await MailService.sendResetCode(email, otpCode);

        res.json({
            message: 'Code de vérification envoyé.',
            previewUrl // Pour le test local uniquement
        });

    } catch (error) {
        console.error('[AUTH ERROR] Reset request failed:', error);
        res.status(500).json({ error: 'Erreur lors de la demande de réinitialisation' });
    }
};

/**
 * 2. Vérifier si le code OTP est bon
 */
export const verifyResetCode = async (req: Request, res: Response) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) return res.status(400).json({ error: "Email et code requis." });

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.resetCode !== code) {
            return res.status(400).json({ error: "Code invalide." });
        }

        if (user.resetCodeExpires && user.resetCodeExpires < new Date()) {
            return res.status(400).json({ error: "Code expiré (15 min écoulées)." });
        }

        res.json({ message: "Code valide. Vous pouvez changer votre mot de passe." });

    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la vérification du code" });
    }
};

/**
 * 3. Enregistrer le nouveau mot de passe
 */
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: 'Données manquantes pour la réinitialisation' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // Vérification finale du code
        if (!user || user.resetCode !== code || (user.resetCodeExpires && user.resetCodeExpires < new Date())) {
            return res.status(400).json({ error: 'Action non autorisée ou code expiré' });
        }

        const hashedPassword = await argon2.hash(newPassword);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetCode: null, // On nettoie le code après usage
                resetCodeExpires: null
            }
        });

        res.json({ message: 'Mot de passe réinitialisé avec succès ! Connectez-vous.' });

    } catch (error) {
        res.status(400).json({ error: 'Erreur lors de la mise à jour du mot de passe' });
    }
};
