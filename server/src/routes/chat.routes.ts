import { Router } from 'express';
import {
    createOrGetChat,
    getChats,
    createGroupChat,
    updateGroupChat,
    deleteChat,
} from '../controllers/chat.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(protect);

router.route('/').get(getChats).post(createOrGetChat);
router.post('/group', createGroupChat);
router.put('/group/:id', updateGroupChat);
router.delete('/:id', deleteChat);

export default router;
