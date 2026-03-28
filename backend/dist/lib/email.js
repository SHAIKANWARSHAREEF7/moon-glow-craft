"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPByEmail = exports.generateOTP = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};
exports.generateOTP = generateOTP;
const sendOTPByEmail = async (email, otp) => {
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const mailOptions = {
        from: '"Moon Glow Craft" <noreply@moonglowcraft.com>',
        to: email,
        subject: 'Your Moon Glow Craft Login OTP',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border-radius: 12px; background: #0a0a0a; color: #fff; text-align: center; border: 1px solid #333;">
            <h1 style="color: #ecc94b; margin-bottom: 30px; font-family: 'Playfair Display', serif; letter-spacing: 2px;">Moon Glow Craft</h1>
            <p style="font-size: 16px; color: #e2e8f0; margin-bottom: 30px;">Your secure one-time password for authentication is:</p>
            <div style="font-size: 32px; font-weight: bold; background: #1a202c; padding: 15px 30px; border-radius: 8px; border: 2px dashed #ecc94b; display: inline-block; color: #ecc94b; letter-spacing: 8px;">
                ${otp}
            </div>
            <p style="font-size: 14px; color: #a0aec0; margin-top: 30px;">This code will expire in 10 minutes. Please do not share this with anyone.</p>
        </div>
        `
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent successfully to ${email}`);
        return true;
    }
    catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
exports.sendOTPByEmail = sendOTPByEmail;
//# sourceMappingURL=email.js.map