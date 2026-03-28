import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { AuthRequest, authenticate } from '../middleware/auth';
import { generateOTP, sendOTPByEmail } from '../lib/email';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;
        
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const validRole = role && ['CUSTOMER', 'ADMIN', 'DRIVER'].includes(role) ? role : 'CUSTOMER';

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: validRole as any,
            }
        });

        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role }, 
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '7d' }
        );

        res.json({ token, role: user.role, name: user.name });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});
router.post('/send-otp', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Auto-register mock user for OTP-only flow
            user = await prisma.user.create({
                data: {
                    email,
                    name: email.split('@')[0],
                    password: 'OTP_LOGIN_NO_PASSWORD',
                    role: 'CUSTOMER'
                }
            });
        }

        await prisma.user.update({
            where: { email },
            data: { otp, otpExpiry }
        });

        const emailSent = await sendOTPByEmail(email, otp);
        if (!emailSent) {
            console.warn(`Email delivery failed for ${email}. Generated OTP is: ${otp}`);
        }

        res.json({ message: 'OTP sent to your email.' }); 
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

router.post('/verify-otp', async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.otp !== otp) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }

        if (user.otpExpiry && new Date() > user.otpExpiry) {
            return res.status(401).json({ error: 'OTP has expired' });
        }

        await prisma.user.update({
            where: { email },
            data: { otp: null, otpExpiry: null }
        });

        const token = jwt.sign(
            { userId: user.id, role: user.role }, 
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '7d' }
        );

        res.json({ token, role: user.role, name: user.name });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, name: true, email: true, role: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
