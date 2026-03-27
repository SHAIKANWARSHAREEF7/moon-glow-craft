import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { authenticate, authorizeRole } from '../middleware/auth';

const router = Router();

// Get all products (Public)
router.get('/', async (req: Request, res: Response) => {
    try {
        const { category } = req.query;
        const filter = category ? { category: category as any } : {};
        const products = await prisma.product.findMany({ where: filter });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product (Public)
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id }
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Create product (Admin only)
router.post('/', authenticate, authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    try {
        const { title, description, price, inventoryCount, imageUrl, category } = req.body;
        
        const product = await prisma.product.create({
            data: { title, description, price, inventoryCount, imageUrl, category }
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Edit product (Admin only)
router.put('/:id', authenticate, authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    try {
        const { title, description, price, inventoryCount, imageUrl, category } = req.body;
        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: { title, description, price, inventoryCount, imageUrl, category }
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

export default router;
