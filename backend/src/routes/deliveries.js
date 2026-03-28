"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const sockets_1 = require("../sockets");
const router = (0, express_1.Router)();
// Get assigned deliveries (Driver)
router.get('/my-tasks', auth_1.authenticate, (0, auth_1.authorizeRole)(['DRIVER']), async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const deliveries = await db_1.prisma.delivery.findMany({
            where: { driverId: req.user.userId },
            include: {
                order: {
                    include: { customer: { select: { name: true, email: true } } }
                }
            },
            orderBy: { assignedAt: 'desc' }
        });
        res.json(deliveries);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});
// Update delivery status (Driver)
// Allowed statuses: Picked Up, Arrived, Delivered
router.put('/:id/status', auth_1.authenticate, (0, auth_1.authorizeRole)(['DRIVER', 'ADMIN']), async (req, res) => {
    try {
        const deliveryId = req.params.id;
        const { status } = req.body;
        if (!['Picked Up', 'Arrived', 'Delivered'].includes(status)) {
            return res.status(400).json({ error: 'Invalid delivery status' });
        }
        const updateData = { status };
        if (status === 'Delivered') {
            updateData.deliveredAt = new Date();
        }
        const delivery = await db_1.prisma.delivery.update({
            where: { id: deliveryId },
            data: updateData
        });
        // Map delivery status to order status
        let mapStatus = 'OUT_FOR_DELIVERY';
        if (status === 'Delivered')
            mapStatus = 'DELIVERED';
        await db_1.prisma.order.update({
            where: { id: delivery.orderId },
            data: { status: mapStatus }
        });
        // Emit real-time update
        (0, sockets_1.updateOrderStatus)(delivery.orderId, mapStatus);
        res.json(delivery);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update delivery status' });
    }
});
exports.default = router;
//# sourceMappingURL=deliveries.js.map