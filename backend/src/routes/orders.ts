import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest, authenticate, authorizeRole } from '../middleware/auth';
import { updateOrderStatus } from '../sockets';

const router = Router();

// Create a new order (Customer)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        
        const { items, paymentMethod, shippingAddress } = req.body; // items: [{ productId, quantity }]
        
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain items' });
        }

        let totalAmount = 0;
        const orderItemsData = [];

        // Validate products and calculate total
        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) return res.status(404).json({ error: `Product ${item.productId} not found` });
            if (product.inventoryCount < item.quantity) {
                return res.status(400).json({ error: `Insufficient inventory for ${product.title}` });
            }
            
            totalAmount += product.price * item.quantity;
            orderItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price
            });

            // Decrease inventory
            await prisma.product.update({
                where: { id: product.id },
                data: { inventoryCount: product.inventoryCount - item.quantity }
            });
        }

        const order = await prisma.order.create({
            data: {
                customerId: req.user.userId,
                totalAmount,
                paymentMethod: paymentMethod || 'RAZORPAY',
                shippingAddress,
                items: {
                    create: orderItemsData
                },
                delivery: {
                    create: {
                        status: 'Pending Assignment'
                    }
                }
            },
            include: { items: true, delivery: true }
        });

        res.status(201).json(order);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Get active orders for a customer
router.get('/my-orders', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const orders = await prisma.order.findMany({
            where: { customerId: req.user.userId },
            include: { items: { include: { product: true } }, delivery: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get all orders (Admin)
router.get('/', authenticate, authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            include: { items: { include: { product: true } }, delivery: true, customer: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Assign order to delivery driver (Admin)
router.put('/:id/assign', authenticate, authorizeRole(['ADMIN']), async (req: Request, res: Response) => {
    try {
        const { driverId } = req.body;
        const orderId = String(req.params.id);

        const delivery = await prisma.delivery.update({
            where: { orderId: orderId },
            data: { 
                driverId, 
                status: 'Assigned',
                assignedAt: new Date()
            }
        });

        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status: 'PREPARING' } // Move to preparing when assigned
        });

        updateOrderStatus(orderId, 'PREPARING')

        res.json({ order, delivery });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to assign driver' });
    }
});

export default router;
