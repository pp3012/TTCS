import { Router } from 'express';
import multer from 'multer';
import { questionController } from '../controllers/QuestionController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
router.use(authenticate);

router.get('/subject/:subjectId', (req, res) => questionController.getBySubject(req, res));
router.get('/:id', (req, res) => questionController.getById(req, res));
router.post('/', requireAdmin, (req, res) => questionController.create(req, res));
router.put('/:id', requireAdmin, (req, res) => questionController.update(req, res));
router.delete('/:id', requireAdmin, (req, res) => questionController.delete(req, res));
router.post('/import/excel', requireAdmin, upload.single('file'), (req, res) => questionController.importFromExcel(req, res));

export default router;
