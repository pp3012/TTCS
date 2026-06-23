import { Router } from 'express';
import { subjectController } from '../controllers/SubjectController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', (req, res) => subjectController.getAll(req, res));
router.get('/difficulty-levels', (req, res) => subjectController.getDifficultyLevels(req, res));
router.get('/question-types', (req, res) => subjectController.getQuestionTypes(req, res));
router.get('/:id', (req, res) => subjectController.getById(req, res));
router.post('/', authenticate, requireAdmin, (req, res) => subjectController.create(req, res));
router.put('/:id', authenticate, requireAdmin, (req, res) => subjectController.update(req, res));
router.delete('/:id', authenticate, requireAdmin, (req, res) => subjectController.delete(req, res));
router.post('/:id/chapters', authenticate, requireAdmin, (req, res) => subjectController.addChapter(req, res));
router.put('/:id/chapters/:chapterId', authenticate, requireAdmin, (req, res) => subjectController.updateChapter(req, res));
export default router;
