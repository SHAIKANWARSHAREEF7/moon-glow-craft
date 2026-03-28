"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all products (Public)
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category: category } : {};
        const products = await db_1.prisma.product.findMany({ where: filter });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
// Get single product (Public)
router.get('/:id', async (req, res) => {
    try {
        const product = await db_1.prisma.product.findUnique({
            where: { id: req.params.id }
        });
        if (!product)
            return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});
// Create product (Admin only)
router.post('/', auth_1.authenticate, (0, auth_1.authorizeRole)(['ADMIN']), async (req, res) => {
    try {
        const { title, description, price, inventoryCount, imageUrl, category } = req.body;
        const product = await db_1.prisma.product.create({
            data: { title, description, price, inventoryCount, imageUrl, category }
        });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});
// Edit product (Admin only)
router.put('/:id', auth_1.authenticate, (0, auth_1.authorizeRole)(['ADMIN']), async (req, res) => {
    try {
        const { title, description, price, inventoryCount, imageUrl, category } = req.body;
        const product = await db_1.prisma.product.update({
            where: { id: req.params.id },
            data: { title, description, price, inventoryCount, imageUrl, category }
        });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map