"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.practiceController = exports.PracticeController = void 0;
const PracticeService_1 = require("../../services/User/PracticeService");
const PersonalizedService_1 = require("../../services/PersonalizedService");
const PracticeSessionDAO_1 = require("../../dao/PracticeSessionDAO");
class PracticeController {
    async createFreeSession(req, res) {
        try {
            const user_id = req.user.user_id;
            const { subject_id, total_questions = 50, time_per_question = 60, chapter_id } = req.body;
            if (!subject_id) {
                res.status(400).json({ success: false, message: 'Thiếu subject_id' });
                return;
            }
            const validQuestions = [30, 40, 50, 60];
            const validTimes = [30, 50, 60, 90];
            const tq = validQuestions.includes(Number(total_questions)) ? Number(total_questions) : 50;
            const tpq = validTimes.includes(Number(time_per_question)) ? Number(time_per_question) : 60;
            const duration = tq * tpq;
            const result = await PracticeService_1.practiceService.createFreeSession(user_id, Number(subject_id), tq, duration, chapter_id ? Number(chapter_id) : undefined);
            res.status(201).json({ success: true, data: result });
        }
        catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    }
    async createPersonalizedSession(req, res) {
        try {
            const user_id = req.user.user_id;
            const { subject_id } = req.body;
            if (!subject_id) {
                res.status(400).json({ success: false, message: 'Thiếu subject_id' });
                return;
            }
            const result = await PersonalizedService_1.personalizedService.createPersonalizedSession(user_id, Number(subject_id));
            res.status(201).json({ success: true, data: result });
        }
        catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    }
    async getQuestions(req, res) {
        try {
            const user_id = req.user.user_id;
            const session_id = Number(req.params.sessionId);
            if (isNaN(session_id)) {
                res.status(400).json({ success: false, message: 'Invalid session_id' });
                return;
            }
            // Gọi hàm getQuestionsBySession từ PracticeService
            const questions = await PracticeService_1.practiceService.getQuestionsBySession(session_id, user_id);
            res.json({ success: true, data: questions });
        }
        catch (err) {
            // 404 nếu không tìm thấy hoặc 403 nếu không có quyền
            res.status(400).json({ success: false, message: err.message });
        }
    }
    async submitSession(req, res) {
        try {
            const user_id = req.user.user_id;
            const session_id = Number(req.params.sessionId);
            const result = await PracticeService_1.practiceService.submitSession(session_id, user_id, req.body);
            res.json({ success: true, data: result });
        }
        catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    }
    async getResult(req, res) {
        try {
            const user_id = req.user.user_id;
            const session_id = Number(req.params.sessionId);
            const result = await PracticeService_1.practiceService.getSessionResult(session_id, user_id);
            res.json({ success: true, data: result });
        }
        catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    }
    async getHistory(req, res) {
        try {
            const user_id = req.user.user_id;
            const { subject_id, page = 1, limit = 10 } = req.query;
            const result = await PracticeSessionDAO_1.practiceSessionDAO.findByUser(user_id, {
                subject_id: subject_id ? Number(subject_id) : undefined,
                page: Number(page),
                limit: Number(limit),
            });
            res.json({ success: true, data: result.sessions, total: result.total, page: Number(page), limit: Number(limit) });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}
exports.PracticeController = PracticeController;
exports.practiceController = new PracticeController();
//# sourceMappingURL=PracticeController.js.map