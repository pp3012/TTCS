"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subjectController = exports.SubjectController = void 0;
const SubjectDAO_1 = require("../dao/SubjectDAO");
const QuestionDAO_1 = require("../dao/QuestionDAO");
const ChapterDAO_1 = require("../dao/ChapterDAO");
const SubjectDTO_1 = require("../dto/SubjectDTO");
class SubjectController {
    async getAll(req, res) {
        try {
            const subjects = await SubjectDAO_1.subjectDAO.findAll();
            // Enrich with question_count
            res.json({ success: true, data: subjects });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async getById(req, res) {
        try {
            const subject_id = Number(req.params.id);
            const subject = await SubjectDAO_1.subjectDAO.findById(subject_id);
            if (!subject) {
                res.status(404).json({ success: false, message: 'Môn học không tồn tại' });
                return;
            }
            const chapters = await ChapterDAO_1.chapterDAO.getChaptersBySubject(subject_id);
            const questionCount = await QuestionDAO_1.questionDAO.countBySubject(subject_id);
            res.json({ success: true, data: { ...subject, chapters, question_count: questionCount } });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async getDifficultyLevels(req, res) {
        try {
            const levels = await ChapterDAO_1.chapterDAO.getDifficultyLevels();
            res.json({ success: true, data: levels });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async getQuestionTypes(req, res) {
        try {
            const types = await ChapterDAO_1.chapterDAO.getQuestionTypes();
            res.json({ success: true, data: types });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async create(req, res) {
        try {
            const errors = (0, SubjectDTO_1.validateCreateSubject)(req.body);
            if (errors.length > 0) {
                res.status(400).json({ success: false, message: errors.join('; ') });
                return;
            }
            const id = await SubjectDAO_1.subjectDAO.create(req.body);
            const subject = await SubjectDAO_1.subjectDAO.findById(id);
            res.status(201).json({ success: true, data: subject });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async update(req, res) {
        try {
            const subject_id = Number(req.params.id);
            await SubjectDAO_1.subjectDAO.update(subject_id, req.body);
            const subject = await SubjectDAO_1.subjectDAO.findById(subject_id);
            res.json({ success: true, data: subject });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async addChapter(req, res) {
        try {
            const subject_id = Number(req.params.id);
            const subject = await SubjectDAO_1.subjectDAO.findById(subject_id);
            if (!subject) {
                res.status(404).json({ success: false, message: 'Môn học không tồn tại' });
                return;
            }
            const chapters = await ChapterDAO_1.chapterDAO.getChaptersBySubject(subject_id);
            const orderIndex = chapters.length + 1;
            const chapterName = String(req.body.chapter_name || '').trim() || `Chương ${orderIndex}`;
            await ChapterDAO_1.chapterDAO.createChapter({ subject_id, chapter_name: chapterName, order_index: orderIndex });
            // Đồng bộ chính xác số chương vào bảng Subjects
            await SubjectDAO_1.subjectDAO.syncTotalChapter(subject_id);
            const updated = await SubjectDAO_1.subjectDAO.findById(subject_id);
            const updatedChapters = await ChapterDAO_1.chapterDAO.getChaptersBySubject(subject_id);
            res.status(201).json({ success: true, data: { ...updated, chapters: updatedChapters } });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async updateChapter(req, res) {
        try {
            const subject_id = Number(req.params.id);
            const chapter_id = Number(req.params.chapterId);
            const chapterName = String(req.body.chapter_name || '').trim();
            if (!chapterName) {
                res.status(400).json({ success: false, message: 'Tên chương không được để trống' });
                return;
            }
            await ChapterDAO_1.chapterDAO.updateChapter(chapter_id, { chapter_name: chapterName });
            const updatedChapters = await ChapterDAO_1.chapterDAO.getChaptersBySubject(subject_id);
            res.json({ success: true, data: { chapters: updatedChapters } });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async delete(req, res) {
        try {
            const subject_id = Number(req.params.id);
            const hasHistory = await SubjectDAO_1.subjectDAO.hasPracticeHistory(subject_id);
            if (hasHistory) {
                res.status(400).json({ success: false, message: 'Không thể xóa môn học này vì đã có lịch sử luyện tập' });
                return;
            }
            const hasQuestions = await SubjectDAO_1.subjectDAO.hasQuestions(subject_id);
            if (hasQuestions) {
                res.status(400).json({ success: false, message: 'Không thể xóa môn học này vì vẫn còn câu hỏi tồn tại trong môn học' });
                return;
            }
            await SubjectDAO_1.subjectDAO.delete(subject_id);
            res.json({ success: true, message: 'Đã xóa môn học' });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}
exports.SubjectController = SubjectController;
exports.subjectController = new SubjectController();
//# sourceMappingURL=SubjectController.js.map