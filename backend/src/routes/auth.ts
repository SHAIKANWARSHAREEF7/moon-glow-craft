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
                isVerified: false // New users start unverified
            }
        });

        // Generate and Send OTP for Verification immediately
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await prisma.user.update({
            where: { id: user.id },
            data: { otp, otpExpiry }
        });
        await sendOTPByEmail(email, otp);

        res.status(201).json({ message: 'User registered successfully. Please verify your OTP.', userId: user.id });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Strict Admin Check
        const isAdminEmail = email === 'shaikanwar7204@gmail.com';
        const isAdminPassword = password === 'Anwar@786';

        let user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            // If it's the specific admin trying to login for the first time, or if we want to auto-create him
            if (isAdminEmail && isAdminPassword) {
                // Auto-create/ensure admin exists (optional, but safer)
                const hashedPassword = await bcrypt.hash(password, 10);
                user = await prisma.user.upsert({
                    where: { email },
                    update: { role: 'ADMIN', isVerified: true },
                    create: { 
                        email, 
                        password: hashedPassword, 
                        name: 'Admin', 
                        role: 'ADMIN', 
                        isVerified: true 
                    }
                });
            } else {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        }

        // If user is ADMIN, check against the specific password provided
        if (user.role === 'ADMIN') {
            if (!isAdminEmail || !isAdminPassword) {
                return res.status(401).json({ error: 'Restricted Admin Access: Invalid Credentials' });
            }
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
        
        if (!user.isVerified) {
            // If not verified, trigger OTP send and inform user
            const otp = generateOTP();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
            await prisma.user.update({ where: { email }, data: { otp, otpExpiry } });
            await sendOTPByEmail(email, otp);
            return res.status(403).json({ error: 'Your account is not verified. A verification OTP has been sent to your email.', unverified: true });
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

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found. Please register first.' });
        }

        // High Security: Restrict ADMIN login to a specific authorized email
        if (user.role === 'ADMIN') {
            const authorizedAdminEmail = process.env.ADMIN_EMAIL;
            if (!authorizedAdminEmail || email.toLowerCase() !== authorizedAdminEmail.toLowerCase()) {
                console.warn(`Unauthorized Admin login attempt from: ${email}`);
                return res.status(403).json({ error: 'Unauthorized access. This account is not authorized for Admin operations.' });
            }
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
            data: { otp: null, otpExpiry: null, isVerified: true } // Mark as verified on success
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

router.get('/drivers', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const drivers = await prisma.user.findMany({
            where: { role: 'DRIVER' },
            select: { id: true, name: true, email: true }
        });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch drivers' });
    }
});

router.post('/forgot-password', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await prisma.user.update({ where: { email }, data: { otp, otpExpiry } });
        await sendOTPByEmail(email, otp);

        res.json({ message: 'Password reset OTP sent to your email' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send reset OTP' });
    }
});

router.post('/reset-password', async (req: Request, res: Response) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user || user.otp !== otp) return res.status(401).json({ error: 'Invalid OTP' });
        if (user.otpExpiry && new Date() > user.otpExpiry) return res.status(401).json({ error: 'OTP expired' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword, otp: null, otpExpiry: null, isVerified: true }
        });

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

export default router;
