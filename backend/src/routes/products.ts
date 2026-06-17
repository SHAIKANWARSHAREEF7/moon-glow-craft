import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest, authenticate, authorizeRole } from '../middleware/auth';

const router = Router();

// Get all products (Public)
router.get('/', async (req: Request, res: Response) => {
    try {
        const category = req.query.category ? String(req.query.category) : undefined;
        const search = req.query.search ? String(req.query.search) : undefined;
        
        const filter: any = {};
        if (category) {
            filter.category = category;
        }
        if (search) {
            filter.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        
        const products = await prisma.product.findMany({ 
            where: filter,
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product (Public)
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: String(req.params.id) }
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Get inventory items for the logged-in seller
router.get('/seller', authenticate, authorizeRole(['SELLER']), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const products = await prisma.product.findMany({
            where: { sellerId: req.user.userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch seller products' });
    }
});

// Create product (Sellers only)
router.post('/', authenticate, authorizeRole(['SELLER']), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { title, description, price, stock, imageUrl, category } = req.body;
        
        const product = await prisma.product.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                stock: parseInt(stock) || 0,
                imageUrl,
                category: category || "OTHER",
                sellerId: req.user.userId
            }
        });
        res.status(201).json(product);
    } catch (error) {
        console.error('Failed to create product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Edit product (Sellers or Admins, with ownership verification)
router.put('/:id', authenticate, authorizeRole(['SELLER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const productId = String(req.params.id);
        
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        
        // Verify ownership (unless Admin)
        if (req.user.role !== 'ADMIN' && product.sellerId !== req.user.userId) {
            return res.status(403).json({ error: 'Forbidden: You do not own this product' });
        }
        
        const { title, description, price, stock, imageUrl, category } = req.body;
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                title,
                description,
                price: price !== undefined ? parseFloat(price) : undefined,
                stock: stock !== undefined ? parseInt(stock) : undefined,
                imageUrl,
                category
            }
        });
        res.json(updatedProduct);
    } catch (error) {
        console.error('Failed to update product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product (Sellers or Admins, with ownership verification)
router.delete('/:id', authenticate, authorizeRole(['SELLER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const productId = String(req.params.id);
        
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        
        // Verify ownership (unless Admin)
        if (req.user.role !== 'ADMIN' && product.sellerId !== req.user.userId) {
            return res.status(403).json({ error: 'Forbidden: You do not own this product' });
        }
        
        await prisma.product.delete({ where: { id: productId } });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Failed to delete product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

export default router;
