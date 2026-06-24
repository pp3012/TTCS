"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PracticeController_1 = require("../controllers/User/PracticeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const StatisticsService_1 = require("../services/StatisticsService");
const router = (0, express_1.Router)();
router.post('/free', authMiddleware_1.authenticate, (req, res) => PracticeController_1.practiceController.createFreeSession(req, res));
router.post('/personalized', authMiddleware_1.authenticate, (req, res) => PracticeController_1.practiceController.createPersonalizedSession(req, res));
router.get('/:sessionId/questions', authMiddleware_1.authenticate, (req, res) => PracticeController_1.practiceController.getQuestions(req, res));
router.post('/:sessionId/submit', authMiddleware_1.authenticate, (req, res) => PracticeController_1.practiceController.submitSession(req, res));
router.get('/:sessionId/result', authMiddleware_1.authenticate, (req, res) => PracticeController_1.practiceController.getResult(req, res));
router.get('/history/me', authMiddleware_1.authenticate, (req, res) => PracticeController_1.practiceController.getHistory(req, res));
router.get('/stats/me', authMiddleware_1.authenticate, async (req, res) => {
    try {
        const user_id = req.user?.user_id;
        const { subject_id } = req.query;
        if (!user_id) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        if (subject_id) {
            const stats = await StatisticsService_1.statisticsService.getUserStatsBySubject(user_id, Number(subject_id));
            res.json({ success: true, data: stats });
        }
        else {
            const stats = await StatisticsService_1.statisticsService.getUserStats(user_id);
            res.json({ success: true, data: stats });
        }
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=practice.js.map