"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const orders_1 = __importDefault(require("../orders"));
const db_1 = require("../../db");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Mock the auth middleware:
app.use((req, res, next) => {
    req.user = { userId: 'mock-user-id', role: 'CUSTOMER' };
    next();
});
app.use('/api/orders', orders_1.default);
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
        const res = await (0, supertest_1.default)(app).post('/api/orders').send({ items: [] });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Order must contain items');
    });
    it('should return 400 if product is out of stock', async () => {
        db_1.prisma.product.findUnique.mockResolvedValueOnce({
            id: 'prod-1',
            title: 'Chocolate',
            price: 100,
            inventoryCount: 1
        });
        const res = await (0, supertest_1.default)(app).post('/api/orders').send({
            items: [{ productId: 'prod-1', quantity: 2 }]
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Insufficient inventory for Chocolate');
    });
    it('should create an order successfully', async () => {
        db_1.prisma.product.findUnique.mockResolvedValueOnce({
            id: 'prod-1',
            title: 'Chocolate',
            price: 100,
            inventoryCount: 10
        });
        db_1.prisma.order.create.mockResolvedValueOnce({
            id: 'order-1',
            customerId: 'mock-user-id',
            totalAmount: 200,
            status: 'PLACED'
        });
        const res = await (0, supertest_1.default)(app).post('/api/orders').send({
            items: [{ productId: 'prod-1', quantity: 2 }],
            shippingAddress: '123 Test St'
        });
        expect(res.status).toBe(201);
        expect(res.body.id).toBe('order-1');
        expect(db_1.prisma.product.update).toHaveBeenCalledWith({
            where: { id: 'prod-1' },
            data: { inventoryCount: 8 }
        });
    });
});
//# sourceMappingURL=orders.test.js.map