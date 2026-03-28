"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const sockets_1 = require("../sockets");
const router = (0, express_1.Router)();
// Create a new order (Customer)
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { items, paymentMethod, shippingAddress } = req.body; // items: [{ productId, quantity }]
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain items' });
        }
        let totalAmount = 0;
        const orderItemsData = [];
        // Validate products and calculate total
        for (const item of items) {
            const product = await db_1.prisma.product.findUnique({ where: { id: item.productId } });
            if (!product)
                return res.status(404).json({ error: `Product ${item.productId} not found` });
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
            await db_1.prisma.product.update({
                where: { id: product.id },
                data: { inventoryCount: product.inventoryCount - item.quantity }
            });
        }
        const order = await db_1.prisma.order.create({
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
    }
    catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});
// Get active orders for a customer
router.get('/my-orders', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const orders = await db_1.prisma.order.findMany({
            where: { customerId: req.user.userId },
            include: { items: { include: { product: true } }, delivery: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});
// Get all orders (Admin)
router.get('/', auth_1.authenticate, (0, auth_1.authorizeRole)(['ADMIN']), async (req, res) => {
    try {
        const orders = await db_1.prisma.order.findMany({
            include: { items: { include: { product: true } }, delivery: true, customer: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});
// Assign order to delivery driver (Admin)
router.put('/:id/assign', auth_1.authenticate, (0, auth_1.authorizeRole)(['ADMIN']), async (req, res) => {
    try {
        const { driverId } = req.body;
        const orderId = req.params.id;
        const delivery = await db_1.prisma.delivery.update({
            where: { orderId: orderId },
            data: {
                driverId,
                status: 'Assigned',
                assignedAt: new Date()
            }
        });
        const order = await db_1.prisma.order.update({
            where: { id: orderId },
            data: { status: 'PREPARING' } // Move to preparing when assigned
        });
        (0, sockets_1.updateOrderStatus)(orderId, 'PREPARING');
        res.json({ order, delivery });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to assign driver' });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map