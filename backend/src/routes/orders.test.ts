import express from 'express';
import request from 'supertest';
import orderRoutes from '../orders';
import { prisma } from '../../db';

const app = express();
app.use(express.json());
// Mock the auth middleware:
app.use((req, res, next) => {
    (req as any).user = { userId: 'mock-user-id', role: 'CUSTOMER' };
    next();
});
app.use('/api/orders', orderRoutes);

jest.mock('../../db', () => ({
    prisma: {
        product: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        order: {
            create: jest.fn(),
        }
    }
}));

describe('Order Creation API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if no items are provided', async () => {
        const res = await request(app).post('/api/orders').send({ items: [] });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Order must contain items');
    });

    it('should return 400 if product is out of stock', async () => {
        (prisma.product.findUnique as jest.Mock).mockResolvedValueOnce({
            id: 'prod-1',
            title: 'Chocolate',
            price: 100,
            inventoryCount: 1
        });

        const res = await request(app).post('/api/orders').send({
            items: [{ productId: 'prod-1', quantity: 2 }]
        });
        
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Insufficient inventory for Chocolate');
    });

    it('should create an order successfully', async () => {
        (prisma.product.findUnique as jest.Mock).mockResolvedValueOnce({
            id: 'prod-1',
            title: 'Chocolate',
            price: 100,
            inventoryCount: 10
        });

        (prisma.order.create as jest.Mock).mockResolvedValueOnce({
            id: 'order-1',
            customerId: 'mock-user-id',
            totalAmount: 200,
            status: 'PLACED'
        });

        const res = await request(app).post('/api/orders').send({
            items: [{ productId: 'prod-1', quantity: 2 }],
            shippingAddress: '123 Test St'
        });

        expect(res.status).toBe(201);
        expect(res.body.id).toBe('order-1');
        expect(prisma.product.update).toHaveBeenCalledWith({
            where: { id: 'prod-1' },
            data: { inventoryCount: 8 }
        });
    });
});
