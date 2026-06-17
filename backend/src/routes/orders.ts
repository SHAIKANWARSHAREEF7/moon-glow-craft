import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest, authenticate, authorizeRole } from '../middleware/auth';
import { io, updateOrderStatus } from '../sockets';
import { sendInvoiceEmail, sendOrderStatusEmail } from '../lib/email';

const router = Router();

// Create a new order (Customer only)
router.post('/', authenticate, authorizeRole(['CUSTOMER']), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        
        const { items, shippingAddress, paymentGateway } = req.body; // items: [{ productId, quantity }], paymentGateway: STRIPE or RAZORPAY
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain items' });
        }
        if (!shippingAddress) {
            return res.status(400).json({ error: 'Shipping address is required' });
        }

        // Validate products, check stock, and compile JSON array of items
        const orderItemsData: any[] = [];
        let totalAmount = 0;

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) {
                return res.status(404).json({ error: `Product with ID ${item.productId} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for product: ${product.title}` });
            }

            totalAmount += product.price * item.quantity;
            orderItemsData.push({
                productId: product.id,
                title: product.title,
                quantity: item.quantity,
                price: product.price,
                imageUrl: product.imageUrl
            });
        }

        // Execute DB operations in a transaction: decrement stock, create order, create transaction ledger
        const result = await prisma.$transaction(async (tx) => {
            // 1. Decrement stock
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            // 2. Create Order
            const order = await tx.order.create({
                data: {
                    customerId: req.user!.userId,
                    items: orderItemsData,
                    totalAmount,
                    shippingAddress,
                    status: 'PENDING'
                },
                include: {
                    customer: {
                        select: { name: true, email: true }
                    }
                }
            });

            // 3. Create Transaction record
            const transaction = await tx.transaction.create({
                data: {
                    orderId: order.id,
                    customerId: req.user!.userId,
                    amount: totalAmount,
                    paymentGateway: paymentGateway || 'STRIPE',
                    transactionStatus: 'PENDING'
                }
            });

            return { order, transaction };
        });

        // Real-time Notification
        if (io) {
            io.emit('newOrder', { ...result.order, transaction: result.transaction });
        }

        res.status(201).json({
            message: 'Order created successfully. Pending payment.',
            orderId: result.order.id,
            totalAmount: result.order.totalAmount,
            transactionId: result.transaction.id
        });
    } catch (error) {
        console.error('Order placement error:', error);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

// Verify payment and activate order status (Public/Webhooks or Customer confirmation)
router.post('/verify-payment', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { orderId, transactionStatus, gatewayReferenceId } = req.body;
        
        if (!orderId || !transactionStatus) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { customer: { select: { name: true, email: true } }, transaction: true }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (transactionStatus === 'SUCCESS') {
            // Update order status to PROCESSING and transaction to SUCCESS
            const updatedResult = await prisma.$transaction(async (tx) => {
                const updatedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'PROCESSING',
                        paymentId: gatewayReferenceId
                    }
                });

                const updatedTx = await tx.transaction.update({
                    where: { orderId },
                    data: {
                        transactionStatus: 'SUCCESS',
                        gatewayReferenceId
                    }
                });

                return { order: updatedOrder, transaction: updatedTx };
            });

            // Trigger Invoice Email
            try {
                const items = order.items as any[];
                await sendInvoiceEmail(
                    order.customer.email,
                    orderId,
                    items,
                    order.totalAmount,
                    order.shippingAddress
                );
            } catch (emailErr) {
                console.error('Failed to send invoice email:', emailErr);
            }

            // Notify real-time
            updateOrderStatus(orderId, 'PROCESSING');
            if (io) {
                io.emit('paymentSuccess', { orderId, gatewayReferenceId });
            }

            res.json({ message: 'Payment verified successfully. Order is processing.', order: updatedResult.order });
        } else {
            // Payment failed: Cancel order, fail transaction, and restore inventory stock
            const updatedResult = await prisma.$transaction(async (tx) => {
                const updatedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: { status: 'CANCELLED' }
                });

                const updatedTx = await tx.transaction.update({
                    where: { orderId },
                    data: {
                        transactionStatus: 'FAILED',
                        gatewayReferenceId
                    }
                });

                // Restore stock
                const items = order.items as any[];
                if (Array.isArray(items)) {
                    for (const item of items) {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stock: { increment: item.quantity } }
                        });
                    }
                }

                return { order: updatedOrder, transaction: updatedTx };
            });

            updateOrderStatus(orderId, 'CANCELLED');
            res.json({ message: 'Payment failed. Order has been cancelled.', order: updatedResult.order });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

// Get customer's own order history (Customer only)
router.get('/my-orders', authenticate, authorizeRole(['CUSTOMER']), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const orders = await prisma.order.findMany({
            where: { customerId: req.user.userId },
            include: { transaction: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customer orders' });
    }
});

// Get seller-specific orders (Seller only)
router.get('/seller', authenticate, authorizeRole(['SELLER']), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const sellerId = req.user.userId;

        // Fetch seller products
        const sellerProducts = await prisma.product.findMany({
            where: { sellerId },
            select: { id: true }
        });
        const sellerProductIds = new Set(sellerProducts.map(p => p.id));

        // Fetch all orders
        const orders = await prisma.order.findMany({
            include: {
                customer: {
                    select: { name: true, email: true, phone: true, address: true }
                },
                transaction: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Filter orders containing seller items
        const sellerOrders = orders.filter((order: any) => {
            const items = order.items as any[];
            if (!Array.isArray(items)) return false;
            return items.some(item => sellerProductIds.has(item.productId));
        }).map((order: any) => {
            const items = order.items as any[];
            const sellerItems = items.filter(item => sellerProductIds.has(item.productId));
            return {
                ...order,
                items: sellerItems // Filter items so seller only sees their own products in the order details
            };
        });

        res.json(sellerOrders);
    } catch (error) {
        console.error('Failed to fetch seller orders:', error);
        res.status(500).json({ error: 'Failed to fetch seller orders' });
    }
});

// Get all orders (Admin only)
router.get('/', authenticate, authorizeRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                customer: {
                    select: { name: true, email: true, phone: true }
                },
                transaction: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch global orders' });
    }
});

// Update order status (Seller or Admin)
router.put('/:id/status', authenticate, authorizeRole(['SELLER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const orderId = String(req.params.id);
        const status = String(req.body.status);

        if (!['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid order status' });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { customer: { select: { name: true, email: true } } }
        }) as any;

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Seller validation: must own at least one item in the order
        if (req.user.role === 'SELLER') {
            const sellerProducts = await prisma.product.findMany({
                where: { sellerId: req.user.userId },
                select: { id: true }
            });
            const sellerProductIds = new Set(sellerProducts.map(p => p.id));
            const items = order.items as any[];
            const hasSellerProduct = Array.isArray(items) && items.some(item => sellerProductIds.has(item.productId));

            if (!hasSellerProduct) {
                return res.status(403).json({ error: 'Forbidden: Order does not contain any of your products' });
            }

            // Sellers can only transition to SHIPPED or DELIVERED
            if (!['SHIPPED', 'DELIVERED'].includes(status)) {
                return res.status(400).json({ error: 'Sellers can only set status to SHIPPED or DELIVERED' });
            }
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: status as any }
        });

        // Trigger Status Email Notification
        try {
            await sendOrderStatusEmail(order.customer.email, orderId, status);
        } catch (emailErr) {
            console.error('Failed to send status email:', emailErr);
        }

        // Notify client real-time
        updateOrderStatus(orderId, status);

        res.json({ message: 'Order status updated successfully', order: updatedOrder });
    } catch (error) {
        console.error('Order status update error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

export default router;
