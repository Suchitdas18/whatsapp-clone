import express from 'express';
import { sendOTP, verifyOTP, resendOTP } from '../controllers/otp.controller';

const router = express.Router();

// OTP routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

export default router;
