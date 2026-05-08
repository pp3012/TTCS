import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.get('/profile', authenticate, (req, res) => authController.getProfile(req, res));
router.put('/change-password', authenticate, (req, res) => authController.changePassword(req, res));

export default router;
