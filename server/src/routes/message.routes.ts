import { Router } from 'express';
import {
    sendMessage,
    getMessages,
    uploadFileMessage,
    updateMessageStatus,
    editMessage,
    deleteMessage,
    searchMessages,
} from '../controllers/message.controller';
import { protect } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// All routes are protected
router.use(protect);

router.post('/', sendMessage);
router.get('/:chatId', getMessages);
router.post('/upload', upload.single('file'), uploadFileMessage);
router.put('/:id/status', updateMessageStatus);
router.put('/:id', editMessage);
router.delete('/:id', deleteMessage);
router.get('/search/:chatId', searchMessages);

export default router;
