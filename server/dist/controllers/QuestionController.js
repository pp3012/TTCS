"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionController = exports.QuestionController = void 0;
const QuestionDAO_1 = require("../dao/QuestionDAO");
const SubjectDAO_1 = require("../dao/SubjectDAO");
const Question_1 = require("../models/Question");
const QuestionDTO_1 = require("../dto/QuestionDTO");
const XLSX = __importStar(require("xlsx"));
class QuestionController {
    async getBySubject(req, res) {
        try {
            const subject_id = Number(req.params.subjectId);
            const { chapter_id, level_id, type_id, page, limit, search } = req.query;
            const result = await QuestionDAO_1.questionDAO.findBySubject(subject_id, {
                chapter_id: chapter_id ? Number(chapter_id) : undefined,
                level_id: level_id ? Number(level_id) : undefined,
                type_id: type_id ? Number(type_id) : undefined,
                search: typeof search === 'string' ? search : undefined,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 20,
            });
            // Admin gets full data, student gets student view
            const isAdmin = req.user?.role === 'admin';
            const data = result.questions.map(q => isAdmin ? Question_1.QuestionModel.fromRow(q).toFullJSON() : Question_1.QuestionModel.fromRow(q).toStudentJSON());
            res.json({ success: true, data, total: result.total });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async getById(req, res) {
        try {
            const q = await QuestionDAO_1.questionDAO.findById(Number(req.params.id));
            if (!q) {
                res.status(404).json({ success: false, message: 'Câu hỏi không tồn tại' });
                return;
            }
            const isAdmin = req.user?.role === 'admin';
            res.json({ success: true, data: isAdmin ? Question_1.QuestionModel.fromRow(q).toFullJSON() : Question_1.QuestionModel.fromRow(q).toStudentJSON() });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async create(req, res) {
        try {
            const errors = (0, QuestionDTO_1.validateCreateQuestion)(req.body);
            if (errors.length > 0) {
                res.status(400).json({ success: false, message: errors.join('; ') });
                return;
            }
            const id = await QuestionDAO_1.questionDAO.create(req.body);
            const q = await QuestionDAO_1.questionDAO.findById(id);
            res.status(201).json({ success: true, data: Question_1.QuestionModel.fromRow(q).toFullJSON() });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async update(req, res) {
        try {
            const question_id = Number(req.params.id);
            const existing = await QuestionDAO_1.questionDAO.findById(question_id);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Câu hỏi không tồn tại' });
                return;
            }
            await QuestionDAO_1.questionDAO.update(question_id, req.body);
            const q = await QuestionDAO_1.questionDAO.findById(question_id);
            res.json({ success: true, data: Question_1.QuestionModel.fromRow(q).toFullJSON() });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async delete(req, res) {
        try {
            const question_id = Number(req.params.id);
            const hasHistory = await QuestionDAO_1.questionDAO.hasPracticeHistory(question_id);
            if (hasHistory) {
                res.status(400).json({ success: false, message: 'Không thể xóa câu hỏi này vì đã có lịch sử luyện tập' });
                return;
            }
            await QuestionDAO_1.questionDAO.delete(question_id);
            res.json({ success: true, message: 'Đã xóa câu hỏi' });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async importFromExcel(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, message: 'Vui lòng tải lên file Excel' });
                return;
            }
            const subject_id = Number(req.body.subject_id);
            if (!subject_id) {
                res.status(400).json({ success: false, message: 'Thiếu subject_id' });
                return;
            }
            // Load danh sách chương của môn được chọn — dùng để map số thứ tự (order_index) trong Excel → chapter_id đúng
            const subjectChapters = await SubjectDAO_1.subjectDAO.findChaptersBySubject(subject_id);
            // Map: order_index -> chapter_id (ví dụ: 1 -> 5, 2 -> 6 nếu môn 2 có chapter_id 5,6)
            const chapterByOrder = new Map();
            subjectChapters.forEach(c => chapterByOrder.set(c.order_index, c.chapter_id));
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);
            let importedCount = 0;
            const errors = [];
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                // Chuyển toàn bộ tên cột thành chữ thường để so sánh cho an toàn
                const lowerRow = {};
                for (const key in row) {
                    lowerRow[key.toLowerCase().trim()] = String(row[key]);
                }
                const findKey = (keywords) => Object.keys(lowerRow).find(k => keywords.some(kw => k.includes(kw)));
                const chapterKey = findKey(['chapter_id', 'chương']);
                const levelKey = findKey(['level_id', 'độ khó', 'mức độ']);
                const typeKey = findKey(['type_id', 'loại']);
                const contentKey = findKey(['content', 'nội dung']);
                const optAKey = findKey(['option_a', 'đáp án a']);
                const optBKey = findKey(['option_b', 'đáp án b']);
                const optCKey = findKey(['option_c', 'đáp án c']);
                const optDKey = findKey(['option_d', 'đáp án d']);
                const correctKey = findKey(['correct_option', 'đáp án đúng']);
                const explKey = findKey(['explanation', 'giải thích']);
                const parseNum = (val) => {
                    if (!val)
                        return undefined;
                    const n = Number(val);
                    return isNaN(n) || n === 0 ? undefined : n;
                };
                // Map số thứ tự chương trong Excel → chapter_id thực tế trong DB của môn đó
                const parseChapterId = (val) => {
                    if (!val)
                        return undefined;
                    const orderNum = Number(val);
                    if (isNaN(orderNum) || orderNum === 0)
                        return undefined;
                    const realId = chapterByOrder.get(orderNum);
                    if (!realId) {
                        // Chương không tồn tại trong môn này — trả về -1 để báo lỗi
                        return -1;
                    }
                    return realId;
                };
                // Map chữ → ID cho độ khó (level)
                const parseLevelId = (val) => {
                    if (!val)
                        return undefined;
                    const s = String(val).toLowerCase().trim();
                    if (s === '1' || s === 'dễ' || s === 'de')
                        return 1;
                    if (s === '2' || s === 'trung bình' || s === 'trung binh' || s === 'tb')
                        return 2;
                    if (s === '3' || s === 'khó' || s === 'kho')
                        return 3;
                    const n = Number(val);
                    return isNaN(n) || n === 0 ? undefined : n;
                };
                // Map chữ → ID cho loại câu hỏi (type)
                const parseTypeId = (val) => {
                    if (!val)
                        return undefined;
                    const s = String(val).toLowerCase().trim();
                    if (s === '1' || s === 'lý thuyết' || s === 'ly thuyet' || s === 'lí thuyết')
                        return 1;
                    if (s === '2' || s === 'bài tập' || s === 'bai tap')
                        return 2;
                    const n = Number(val);
                    return isNaN(n) || n === 0 ? undefined : n;
                };
                const rawChapterId = chapterKey ? parseChapterId(lowerRow[chapterKey]) : undefined;
                // Báo lỗi nếu số chương không tồn tại trong môn
                if (rawChapterId === -1) {
                    const orderVal = chapterKey ? lowerRow[chapterKey] : '?';
                    errors.push(`Dòng ${i + 2}: Chương số ${orderVal} không tồn tại trong môn này`);
                    continue;
                }
                const data = {
                    subject_id,
                    chapter_id: rawChapterId,
                    level_id: levelKey ? parseLevelId(lowerRow[levelKey]) : undefined,
                    type_id: typeKey ? parseTypeId(lowerRow[typeKey]) : undefined,
                    content: contentKey ? lowerRow[contentKey] : '',
                    option_a: optAKey ? lowerRow[optAKey] : '',
                    option_b: optBKey ? lowerRow[optBKey] : '',
                    option_c: optCKey ? lowerRow[optCKey] : '',
                    option_d: optDKey ? lowerRow[optDKey] : '',
                    correct_option: correctKey ? lowerRow[correctKey].toUpperCase().trim() : '',
                    explanation: explKey ? lowerRow[explKey] : undefined,
                };
                const errs = (0, QuestionDTO_1.validateCreateQuestion)(data);
                if (errs.length > 0) {
                    errors.push(`Dòng ${i + 2}: ${errs.join(', ')}`);
                    continue;
                }
                await QuestionDAO_1.questionDAO.create(data);
                importedCount++;
            }
            res.json({ success: true, message: `Nhập thành công ${importedCount} câu hỏi`, errors });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async downloadTemplate(req, res) {
        try {
            const workbook = XLSX.utils.book_new();
            const sheetData = [
                ['chapter_id', 'level_id', 'type_id', 'content', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'explanation'],
                ['1', '1', '1', 'Câu hỏi mẫu 1', 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D', 'A', 'Giải thích mẫu'],
                ['1', '2', '2', 'Câu hỏi mẫu 2', 'Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D', 'B', '']
            ];
            const sheet = XLSX.utils.aoa_to_sheet(sheetData);
            sheet['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }];
            XLSX.utils.book_append_sheet(workbook, sheet, 'Template');
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            res.setHeader('Content-Disposition', 'attachment; filename="Template_NhapCauHoi.xlsx"');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}
exports.QuestionController = QuestionController;
exports.questionController = new QuestionController();
//# sourceMappingURL=QuestionController.js.map