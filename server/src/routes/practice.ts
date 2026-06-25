import { Router } from 'express';
import { practiceController } from '../controllers/User/PracticeController';
import { authenticate } from '../middleware/authMiddleware';
import { statsController } from '../controllers/StatsController';

const router = Router();
router.use(authenticate);

router.post('/free', (req, res) => practiceController.createFreeSession(req, res));
router.post('/personalized', (req, res) => practiceController.createPersonalizedSession(req, res));
router.get('/:sessionId/questions', (req, res) => practiceController.getQuestions(req, res));
router.post('/:sessionId/submit', (req, res) => practiceController.submitSession(req, res));
router.get('/:sessionId/result', (req, res) => practiceController.getResult(req, res));
router.get('/history/me', (req, res) => practiceController.getHistory(req, res));
router.get('/stats/me', (req, res) => statsController.getUserStats(req, res));
/*
router.get('/stats/me', async (req, res) => {
  try {
    const user_id = ((req as any) as { user?: { user_id: number } }).user?.user_id;
    const { subject_id } = req.query;
    if (!user_id) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
    if (subject_id) {
      const stats = await statisticsService.getUserStatsBySubject(user_id, Number(subject_id));
      res.json({ success: true, data: stats });
    } else {
      const stats = await statisticsService.getUserStats(user_id);
      res.json({ success: true, data: stats });
    }
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});
*/
export default router;
