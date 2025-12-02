import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
    // For development, use ethereal.email (fake SMTP)
    // For production, use real SMTP service (Gmail, SendGrid, etc.)

    if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Development: Log to console instead of sending
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
            pass: process.env.SMTP_PASS || 'ethereal.pass',
        },
    });
};

export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.SMTP_FROM || 'WhatsApp Clone <noreply@whatsappclone.com>',
            to: email,
            subject: 'Verify Your Email - WhatsApp Clone',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #25D366;">Welcome to WhatsApp Clone!</h2>
                    <p>Your verification code is:</p>
                    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #888; font-size: 12px;">This is an automated message, please do not reply.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);

        if (process.env.NODE_ENV !== 'production') {
            console.log('✉️  OTP Email sent:', nodemailer.getTestMessageUrl(info));
            console.log('📧 Email:', email, '| OTP:', otp);
        }
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send verification email');
    }
};

export const sendPhoneOTP = async (phone: string, otp: string): Promise<void> => {
    // For now, just log to console
    // In production, integrate with Twilio, AWS SNS, or other SMS service
    console.log(`📱 SMS OTP for ${phone}: ${otp}`);
    console.log('⚠️  Note: SMS integration not configured. Use email verification or integrate Twilio.');

    // TODO: Integrate with SMS service
    // Example with Twilio:
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({
    //     body: `Your WhatsApp Clone verification code is: ${otp}`,
    //     from: twilioPhoneNumber,
    //     to: phone
    // });
};
