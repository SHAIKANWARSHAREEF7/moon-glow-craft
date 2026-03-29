import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest, authenticate, authorizeRole } from '../middleware/auth';
import { updateOrderStatus } from '../sockets';

const router = Router();

// Get assigned deliveries (Driver)
router.get('/my-tasks', authenticate, authorizeRole(['DRIVER']), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const deliveries = await prisma.delivery.findMany({
            where: { driverId: req.user.userId },
            include: { 
                order: { 
                    include: { customer: { select: { name: true, email: true } } } 
                } 
            },
            orderBy: { assignedAt: 'desc' }
        });
        res.json(deliveries);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Update delivery status (Driver)
// Allowed statuses: Picked Up, Arrived, Delivered
router.put('/:id/status', authenticate, authorizeRole(['DRIVER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
    try {
        const deliveryId = req.params.id as string;
        const { status } = req.body;

        if (!['Picked Up', 'Arrived', 'Delivered'].includes(status)) {
            return res.status(400).json({ error: 'Invalid delivery status' });
        }

        const updateData: any = { status };
        if (status === 'Delivered') {
            updateData.deliveredAt = new Date();
        }

        const delivery = await prisma.delivery.update({
            where: { id: deliveryId },
            data: updateData
        });

        // Map delivery status to order status
        let mapStatus = 'OUT_FOR_DELIVERY';
        if (status === 'Delivered') mapStatus = 'DELIVERED';

        await prisma.order.update({
            where: { id: delivery.orderId },
            data: { status: mapStatus as any }
        });

        // Emit real-time update
        updateOrderStatus(delivery.orderId, mapStatus);

        res.json(delivery);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update delivery status' });
    }
});

export default router;
