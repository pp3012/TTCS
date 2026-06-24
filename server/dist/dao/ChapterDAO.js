"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chapterDAO = exports.ChapterDAO = void 0;
const database_1 = __importDefault(require("../config/database"));
class ChapterDAO {
    async getChaptersBySubject(subject_id) {
        const [rows] = await database_1.default.query('SELECT * FROM Chapters WHERE subject_id = ? ORDER BY order_index', [subject_id]);
        return rows;
    }
    async createChapter(data) {
        const [result] = await database_1.default.query('INSERT INTO Chapters (subject_id, chapter_name, order_index) VALUES (?, ?, ?)', [data.subject_id, data.chapter_name, data.order_index || null]);
        return result.insertId;
    }
    async updateChapter(chapter_id, data) {
        const [result] = await database_1.default.query('UPDATE Chapters SET chapter_name = ? WHERE chapter_id = ?', [data.chapter_name, chapter_id]);
        return result.affectedRows > 0;
    }
    async getDifficultyLevels() {
        const [rows] = await database_1.default.query('SELECT * FROM Difficulty_levels');
        return rows;
    }
    async getQuestionTypes() {
        const [rows] = await database_1.default.query('SELECT * FROM Question_type');
        return rows;
    }
}
exports.ChapterDAO = ChapterDAO;
exports.chapterDAO = new ChapterDAO();
//# sourceMappingURL=ChapterDAO.js.map