"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SubjectController_1 = require("../controllers/SubjectController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', (req, res) => SubjectController_1.subjectController.getAll(req, res));
router.get('/difficulty-levels', (req, res) => SubjectController_1.subjectController.getDifficultyLevels(req, res));
router.get('/question-types', (req, res) => SubjectController_1.subjectController.getQuestionTypes(req, res));
router.get('/:id', (req, res) => SubjectController_1.subjectController.getById(req, res));
router.post('/', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, (req, res) => SubjectController_1.subjectController.create(req, res));
router.put('/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, (req, res) => SubjectController_1.subjectController.update(req, res));
router.delete('/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, (req, res) => SubjectController_1.subjectController.delete(req, res));
router.post('/:id/chapters', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, (req, res) => SubjectController_1.subjectController.addChapter(req, res));
router.put('/:id/chapters/:chapterId', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, (req, res) => SubjectController_1.subjectController.updateChapter(req, res));
exports.default = router;
//# sourceMappingURL=subjects.js.map