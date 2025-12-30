import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';

// Schéma de validation
const documentSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    url: z.string(),
    subject: z.string(),
    className: z.string(),
    year: z.number(),
    type: z.enum(['COURSE', 'EXERCISE', 'HOMEWORK', 'CORRECTION']),
});

export const getDocuments = async (req: Request, res: Response) => {
    try {
        const { subject, className, year, type } = req.query;

        const filters: any = {};
        if (subject) filters.subject = subject;
        if (className) filters.className = className;
        if (year) filters.year = parseInt(year as string);
        if (type) filters.type = type;

        const documents = await prisma.document.findMany({
            where: filters,
            orderBy: { createdAt: 'desc' },
        });

        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching documents' });
    }
};

export const createDocument = async (req: Request, res: Response) => {
    try {
        const data = documentSchema.parse(req.body);

        const doc = await prisma.document.create({
            data,
        });

        res.status(201).json(doc);
    } catch (error) {
        res.status(400).json({ error: 'Invalid data', details: error });
    }
};

export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.document.delete({ where: { id } });
        res.json({ message: 'Document deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting document' });
    }
};
