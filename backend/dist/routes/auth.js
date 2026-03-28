"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const email_1 = require("../lib/email");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const existingUser = await db_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const validRole = role && ['CUSTOMER', 'ADMIN', 'DRIVER'].includes(role) ? role : 'CUSTOMER';
        const user = await db_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: validRole,
            }
        });
        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isValid = await bcrypt_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
        res.json({ token, role: user.role, name: user.name });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const otp = (0, email_1.generateOTP)();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        let user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Auto-register mock user for OTP-only flow
            user = await db_1.prisma.user.create({
                data: {
                    email,
                    name: email.split('@')[0],
                    password: 'OTP_LOGIN_NO_PASSWORD',
                    role: 'CUSTOMER'
                }
            });
        }
        await db_1.prisma.user.update({
            where: { email },
            data: { otp, otpExpiry }
        });
        const emailSent = await (0, email_1.sendOTPByEmail)(email, otp);
        if (!emailSent) {
            console.warn(`Email delivery failed for ${email}. Generated OTP is: ${otp}`);
        }
        res.json({ message: 'OTP processed', devCode: otp });
    }
    catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user || user.otp !== otp) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }
        if (user.otpExpiry && new Date() > user.otpExpiry) {
            return res.status(401).json({ error: 'OTP has expired' });
        }
        await db_1.prisma.user.update({
            where: { email },
            data: { otp: null, otpExpiry: null }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
        res.json({ token, role: user.role, name: user.name });
    }
    catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, name: true, email: true, role: true }
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map