"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const QuestionController_1 = require("../controllers/QuestionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
router.get('/subject/:subjectId', authMiddleware_1.authenticate, (req, res) => QuestionController_1.questionController.getBySubject(req, res));
router.get('/import/template', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, (req, res) => QuestionController_1.questionController.downloadTemplate(req, res));
router.get('/:id', authMiddleware_1.authenticate, (req, res) => QuestionController_1.questionController.getById(req, res));
router.post('/', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, (req, res) => QuestionController_1.questionController.create(req, res));
router.put('/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, (req, res) => QuestionController_1.questionController.update(req, res));
router.delete('/:id', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, (req, res) => QuestionController_1.questionController.delete(req, res));
router.post('/import/excel', authMiddleware_1.authenticate, authMiddleware_1.requireAdmin, upload.single('file'), (req, res) => QuestionController_1.questionController.importFromExcel(req, res));
exports.default = router;
//# sourceMappingURL=questions.js.map