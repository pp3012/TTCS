"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subjectDAO = exports.SubjectDAO = void 0;
const database_1 = __importDefault(require("../config/database"));
class SubjectDAO {
    // Lấy danh sách tất cả môn học
    async findAll() {
        const [rows] = await database_1.default.query(`SELECT s.subject_id, s.subject_name, COUNT(DISTINCT c.chapter_id) as total_chapter,
                s.description, COUNT(DISTINCT q.question_id) as question_count
         FROM Subjects s
         LEFT JOIN Chapters c ON s.subject_id = c.subject_id
         LEFT JOIN Questions q ON s.subject_id = q.subject_id
         GROUP BY s.subject_id
         ORDER BY s.subject_id`);
        return rows;
    }
    //Tìm môn học theo id
    async findById(subject_id) {
        const [rows] = await database_1.default.query(`SELECT s.subject_id, s.subject_name, COUNT(c.chapter_id) as total_chapter, s.description
         FROM Subjects s
         LEFT JOIN Chapters c ON s.subject_id = c.subject_id
         WHERE s.subject_id = ?
         GROUP BY s.subject_id`, [subject_id]);
        return rows.length > 0 ? rows[0] : null;
    }
    //Thêm mới môn hoc
    async create(data) {
        const totalChapter = Math.max(0, Number(data.total_chapter) || 0);
        const conn = await database_1.default.getConnection();
        try {
            await conn.beginTransaction();
            const [result] = await conn.query('INSERT INTO Subjects (subject_name, total_chapter, description) VALUES (?, ?, ?)', [data.subject_name, totalChapter, data.description || null]);
            for (let i = 1; i <= totalChapter; i++) {
                await conn.query('INSERT INTO Chapters (subject_id, chapter_name, order_index) VALUES (?, ?, ?)', [result.insertId, `Chương ${i}`, i]);
            }
            await conn.commit();
            return result.insertId;
        }
        catch (err) {
            await conn.rollback();
            throw err;
        }
        finally {
            conn.release();
        }
    }
    //Chỉnh sửa môn học theo id
    async update(subject_id, data) {
        const conn = await database_1.default.getConnection();
        try {
            await conn.beginTransaction();
            const fields = [];
            const values = [];
            if (data.subject_name) {
                fields.push('subject_name = ?');
                values.push(data.subject_name);
            }
            if (data.description !== undefined) {
                fields.push('description = ?');
                values.push(data.description);
            }
            if (fields.length > 0) {
                values.push(subject_id);
                await conn.query(`UPDATE Subjects
                          SET ${fields.join(', ')}
                          WHERE subject_id = ?`, values);
            }
            if (data.total_chapter !== undefined) {
                const targetTotal = Math.max(0, Number(data.total_chapter) || 0);
                const [chapterRows] = await conn.query('SELECT * FROM Chapters WHERE subject_id = ? ORDER BY order_index, chapter_id', [subject_id]);
                const chapters = chapterRows;
                if (targetTotal > chapters.length) {
                    for (let i = chapters.length + 1; i <= targetTotal; i++) {
                        await conn.query('INSERT INTO Chapters (subject_id, chapter_name, order_index) VALUES (?, ?, ?)', [subject_id, `Chương ${i}`, i]);
                    }
                }
                if (targetTotal < chapters.length) {
                    const removedChapters = chapters.slice(targetTotal);
                    const removedIds = removedChapters.map(c => c.chapter_id);
                    const placeholders = removedIds.map(() => '?').join(',');
                    const [questionRows] = await conn.query(`SELECT COUNT(*) as total FROM Questions WHERE chapter_id IN (${placeholders})`, removedIds);
                    const questionTotal = Number(questionRows[0].total);
                    if (questionTotal > 0) {
                        const names = removedChapters.map(c => c.chapter_name).join(', ');
                        throw new Error(`Không thể giảm tổng số chương vì ${names} đang có câu hỏi`);
                    }
                    await conn.query(`DELETE FROM Chapters WHERE chapter_id IN (${placeholders})`, removedIds);
                }
                const [remainingRows] = await conn.query('SELECT chapter_id FROM Chapters WHERE subject_id = ? ORDER BY order_index, chapter_id', [subject_id]);
                for (let i = 0; i < remainingRows.length; i++) {
                    await conn.query('UPDATE Chapters SET order_index = ? WHERE chapter_id = ?', [i + 1, remainingRows[i].chapter_id]);
                }
                await conn.query('UPDATE Subjects SET total_chapter = ? WHERE subject_id = ?', [targetTotal, subject_id]);
            }
            await conn.commit();
        }
        catch (err) {
            await conn.rollback();
            throw err;
        }
        finally {
            conn.release();
        }
    }
    async hasPracticeHistory(subject_id) {
        const [psRows] = await database_1.default.query('SELECT COUNT(*) as total FROM Practice_sessions WHERE subject_id = ?', [subject_id]);
        const [uqsRows] = await database_1.default.query('SELECT COUNT(*) as total FROM User_question_status uqs JOIN Questions q ON uqs.question_id = q.question_id WHERE q.subject_id = ?', [subject_id]);
        const [saRows] = await database_1.default.query('SELECT COUNT(*) as total FROM Session_answers sa JOIN Questions q ON sa.question_id = q.question_id WHERE q.subject_id = ?', [subject_id]);
        const [usRows] = await database_1.default.query('SELECT COUNT(*) as total FROM User_stats WHERE subject_id = ?', [subject_id]);
        return (psRows[0].total > 0) || (uqsRows[0].total > 0) || (saRows[0].total > 0) || (usRows[0].total > 0);
    }
    async hasQuestions(subject_id) {
        const [rows] = await database_1.default.query('SELECT COUNT(*) as total FROM Questions WHERE subject_id = ?', [subject_id]);
        return rows[0].total > 0;
    }
    //Xoá môn học theo íd
    async delete(subject_id) {
        await database_1.default.query('DELETE FROM Subjects WHERE subject_id = ?', [subject_id]);
    }
    // Đồng bộ tổng số chương
    async syncTotalChapter(subject_id) {
        await database_1.default.query('UPDATE Subjects SET total_chapter = (SELECT COUNT(*) FROM Chapters WHERE subject_id = ?) WHERE subject_id = ?', [subject_id, subject_id]);
    }
    // Lấy danh sách chương theo môn học (dùng khi import Excel)
    async findChaptersBySubject(subject_id) {
        const [rows] = await database_1.default.query('SELECT chapter_id, chapter_name, order_index FROM Chapters WHERE subject_id = ? ORDER BY order_index, chapter_id', [subject_id]);
        return rows;
    }
}
exports.SubjectDAO = SubjectDAO;
exports.subjectDAO = new SubjectDAO();
//# sourceMappingURL=SubjectDAO.js.map