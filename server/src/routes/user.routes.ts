import { Router } from 'express';
import {
    getUsers,
    getUserById,
    updateProfile,
    uploadAvatar,
} from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// All routes are protected
router.use(protect);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/profile', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

export default router;
