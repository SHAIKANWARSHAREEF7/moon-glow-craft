import nodemailer from 'nodemailer';

export const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

const getTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASS || ''
        }
    });
};

export const sendOTPByEmail = async (email: string, otp: string) => {
    const mailOptions = {
        from: '"Moon Glow Craft" <noreply@moonglowcraft.com>',
        to: email,
        subject: 'Your Moon Glow Craft Login OTP',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border-radius: 12px; background: #0b1329; color: #fff; text-align: center; border: 1px solid #1e293b;">
            <h1 style="color: #ecc94b; margin-bottom: 30px; font-family: sans-serif; letter-spacing: 2px;">Moon Glow Craft</h1>
            <p style="font-size: 16px; color: #e2e8f0; margin-bottom: 30px;">Your secure one-time password for authentication is:</p>
            <div style="font-size: 32px; font-weight: bold; background: #1c2541; padding: 15px 30px; border-radius: 8px; border: 2px dashed #ecc94b; display: inline-block; color: #ecc94b; letter-spacing: 8px;">
                ${otp}
            </div>
            <p style="font-size: 14px; color: #a0aec0; margin-top: 30px;">This code will expire in 10 minutes. Please do not share this with anyone.</p>
        </div>
        `
    };

    console.log(`[EMAIL SENDING] Attempting to send OTP email to ${email}. Code: ${otp}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[MOCK EMAIL] SMTP credentials not set. Simulated sending OTP email to ${email} (OTP: ${otp})`);
        return true;
    }

    try {
        const transporter = getTransporter();
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
    const mailOptions = {
        from: '"Moon Glow Craft" <noreply@moonglowcraft.com>',
        to: email,
        subject: 'Welcome to Moon Glow Craft!',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border-radius: 12px; background: #0b1329; color: #fff; text-align: center; border: 1px solid #1e293b;">
            <h1 style="color: #ecc94b; margin-bottom: 20px; font-family: sans-serif;">Welcome to Moon Glow Craft</h1>
            <p style="font-size: 16px; color: #e2e8f0; line-height: 1.6;">Hello ${name},</p>
            <p style="font-size: 16px; color: #e2e8f0; line-height: 1.6;">Thank you for registering at Moon Glow Craft. Discover a curated collection of handcrafted artisan goods designed to bring a touch of ethereal beauty and magic into your everyday life.</p>
            <div style="margin-top: 35px; border-top: 1px solid #1e293b; padding-top: 20px;">
                <p style="font-size: 12px; color: #a0aec0;">You received this because you signed up on our platform.</p>
            </div>
        </div>
        `
    };

    console.log(`[EMAIL SENDING] Attempting to send Welcome email to ${email} (${name})`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[MOCK EMAIL] SMTP credentials not set. Simulated sending Welcome email to ${email}`);
        return true;
    }

    try {
        const transporter = getTransporter();
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending Welcome email:', error);
        return false;
    }
};

export const sendInvoiceEmail = async (email: string, orderId: string, items: any[], totalAmount: number, shippingAddress: string) => {
    const itemsListHtml = items.map(item => `
        <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 10px 0; color: #e2e8f0;">${item.title || 'Product'}</td>
            <td style="padding: 10px 0; text-align: center; color: #a0aec0;">x${item.quantity}</td>
            <td style="padding: 10px 0; text-align: right; color: #ecc94b;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const mailOptions = {
        from: '"Moon Glow Craft" <noreply@moonglowcraft.com>',
        to: email,
        subject: `Your Moon Glow Craft Order Invoice #${orderId.slice(0, 8)}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 12px; background: #0b1329; color: #fff; border: 1px solid #1e293b;">
            <h2 style="color: #ecc94b; border-bottom: 2px solid #1e293b; padding-bottom: 15px; margin-top: 0; text-align: center;">Order Invoice</h2>
            <p style="color: #a0aec0;">Order ID: <strong style="color: #fff;">${orderId}</strong></p>
            <p style="color: #a0aec0;">Shipping To: <br/><strong style="color: #fff; font-style: italic;">${shippingAddress}</strong></p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 25px;">
                <thead>
                    <tr style="border-bottom: 2px solid #1e293b; text-align: left;">
                        <th style="padding-bottom: 10px; color: #a0aec0;">Item</th>
                        <th style="padding-bottom: 10px; text-align: center; color: #a0aec0;">Qty</th>
                        <th style="padding-bottom: 10px; text-align: right; color: #a0aec0;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsListHtml}
                    <tr>
                        <td colspan="2" style="padding: 15px 0 0; font-weight: bold; font-size: 16px;">Total Amount Paid</td>
                        <td style="padding: 15px 0 0; text-align: right; font-weight: bold; font-size: 18px; color: #ecc94b;">$${totalAmount.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            
            <div style="margin-top: 35px; border-top: 1px solid #1e293b; padding-top: 20px; text-align: center;">
                <p style="font-size: 14px; color: #e2e8f0;">Thank you for shopping with us!</p>
                <p style="font-size: 12px; color: #a0aec0;">Moon Glow Craft team</p>
            </div>
        </div>
        `
    };

    console.log(`[EMAIL SENDING] Attempting to send Invoice email to ${email} for Order #${orderId}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[MOCK EMAIL] SMTP credentials not set. Simulated sending Invoice email to ${email} for Order #${orderId}`);
        console.log(`Invoice Details: Total $${totalAmount.toFixed(2)}, items count: ${items.length}, address: ${shippingAddress}`);
        return true;
    }

    try {
        const transporter = getTransporter();
        await transporter.sendMail(mailOptions);
        console.log(`Invoice email sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending Invoice email:', error);
        return false;
    }
};

export const sendOrderStatusEmail = async (email: string, orderId: string, status: string) => {
    const mailOptions = {
        from: '"Moon Glow Craft" <noreply@moonglowcraft.com>',
        to: email,
        subject: `Moon Glow Craft: Order #${orderId.slice(0, 8)} Status Update`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border-radius: 12px; background: #0b1329; color: #fff; text-align: center; border: 1px solid #1e293b;">
            <h2 style="color: #ecc94b; margin-bottom: 25px;">Order Status Update</h2>
            <p style="font-size: 16px; color: #e2e8f0; line-height: 1.6;">Your order with ID <strong style="color: #fff;">#${orderId}</strong> has been updated to:</p>
            <div style="font-size: 24px; font-weight: bold; background: #1c2541; padding: 12px 25px; border-radius: 8px; display: inline-block; color: #ecc94b; margin: 20px 0; text-transform: uppercase; border: 1px solid #1e293b;">
                ${status}
            </div>
            <p style="font-size: 14px; color: #a0aec0; margin-top: 25px;">We will keep you updated as your package makes its way to you.</p>
        </div>
        `
    };

    console.log(`[EMAIL SENDING] Attempting to send Status Update email to ${email} (Order #${orderId} -> ${status})`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[MOCK EMAIL] SMTP credentials not set. Simulated sending Status Update email to ${email} (Status: ${status})`);
        return true;
    }

    try {
        const transporter = getTransporter();
        await transporter.sendMail(mailOptions);
        console.log(`Status update email sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending status update email:', error);
        return false;
    }
};
