import { Router } from 'express';
import { adminController } from '../controllers/AdminController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/users', (req, res) => adminController.getUsers(req, res));
router.post('/users', (req, res) => adminController.createUser(req, res));
router.get('/users/:id', (req, res) => adminController.getUserById(req, res));
router.put('/users/:id', (req, res) => adminController.updateUser(req, res));
router.delete('/users/:id', (req, res) => adminController.deleteUser(req, res));
router.get('/stats/subjects', (req, res) => adminController.getSubjectStats(req, res));
router.get('/stats/users', (req, res) => adminController.getUserStats(req, res));

export default router;
