import express from 'express';
import { searchContacts, findByPhones, startChat } from '../controllers/contact.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Contact routes (all protected)
router.post('/search', protect, searchContacts);
router.post('/find-by-phones', protect, findByPhones);
router.post('/start-chat', protect, startChat);

export default router;
