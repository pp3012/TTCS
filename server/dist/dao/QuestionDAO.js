"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionDAO = exports.QuestionDAO = void 0;
const database_1 = __importDefault(require("../config/database"));
class QuestionDAO {
    constructor() {
        this.selectJoin = `
    SELECT q.*, s.subject_name, c.chapter_name, dl.level_name, qt.type_name
    FROM Questions q
    LEFT JOIN Subjects s ON q.subject_id = s.subject_id
    LEFT JOIN Chapters c ON q.chapter_id = c.chapter_id
    LEFT JOIN Difficulty_levels dl ON q.level_id = dl.level_id
    LEFT JOIN Question_type qt ON q.type_id = qt.type_id
  `;
    }
    async findById(question_id) {
        const [rows] = await database_1.default.query(`${this.selectJoin} WHERE q.question_id = ?`, [question_id]);
        return rows.length > 0 ? rows[0] : null;
    }
    async findBySubject(subject_id, filters) {
        const conditions = ['q.subject_id = ?'];
        const params = [subject_id];
        if (filters?.chapter_id) {
            conditions.push('q.chapter_id = ?');
            params.push(filters.chapter_id);
        }
        if (filters?.level_id) {
            conditions.push('q.level_id = ?');
            params.push(filters.level_id);
        }
        if (filters?.type_id) {
            conditions.push('q.type_id = ?');
            params.push(filters.type_id);
        }
        if (filters?.search?.trim()) {
            const like = `%${filters.search.trim()}%`;
            conditions.push('(q.content LIKE ? OR c.chapter_name LIKE ? OR dl.level_name LIKE ? OR qt.type_name LIKE ?)');
            params.push(like, like, like, like);
        }
        const whereSql = ` WHERE ${conditions.join(' AND ')}`;
        let sql = `${this.selectJoin}${whereSql}`;
        const countSql = `
      SELECT COUNT(*) as total
      FROM Questions q
      LEFT JOIN Chapters c ON q.chapter_id = c.chapter_id
      LEFT JOIN Difficulty_levels dl ON q.level_id = dl.level_id
      LEFT JOIN Question_type qt ON q.type_id = qt.type_id
      ${whereSql}
    `;
        const countParams = [...params];
        const [countRows] = await database_1.default.query(countSql, countParams);
        const total = countRows[0].total;
        sql += ' ORDER BY q.question_id';
        if (filters?.limit) {
            sql += ' LIMIT ? OFFSET ?';
            params.push(filters.limit);
            params.push(((filters.page || 1) - 1) * filters.limit);
        }
        const [rows] = await database_1.default.query(sql, params);
        return { questions: rows, total };
    }
    async findRandomBySubject(subject_id, count, chapter_id) {
        let sql = `${this.selectJoin} WHERE q.subject_id = ?`;
        const params = [subject_id];
        if (chapter_id) {
            sql += ' AND q.chapter_id = ?';
            params.push(chapter_id);
        }
        sql += ' ORDER BY RAND() LIMIT ?';
        params.push(count);
        const [rows] = await database_1.default.query(sql, params);
        return rows;
    }
    async findByIds(ids) {
        if (ids.length === 0)
            return [];
        const placeholders = ids.map(() => '?').join(',');
        const [rows] = await database_1.default.query(`${this.selectJoin} WHERE q.question_id IN (${placeholders})`, ids);
        return rows;
    }
    async findBySubjectGrouped(subject_id) {
        const [rows] = await database_1.default.query(`${this.selectJoin} WHERE q.subject_id = ? ORDER BY q.chapter_id, q.level_id`, [subject_id]);
        return rows;
    }
    async create(data) {
        const [result] = await database_1.default.query(`INSERT INTO Questions (subject_id, chapter_id, level_id, type_id, content, option_a, option_b, option_c, option_d, correct_option, explanation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [data.subject_id, data.chapter_id || null, data.level_id || null, data.type_id || null,
            data.content, data.option_a, data.option_b, data.option_c, data.option_d,
            data.correct_option, data.explanation || null]);
        return result.insertId;
    }
    async update(question_id, data) {
        const fields = [];
        const values = [];
        const allowed = ['chapter_id', 'level_id', 'type_id', 'content', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'explanation'];
        for (const key of allowed) {
            if (key in data) {
                let val = data[key];
                // Cast 0 to null for foreign keys so MySQL doesn't throw constraint fails
                if (['chapter_id', 'level_id', 'type_id'].includes(key) && (val === 0 || val === '0')) {
                    val = null;
                }
                fields.push(`${key} = ?`);
                values.push(val);
            }
        }
        if (fields.length === 0)
            return;
        values.push(question_id);
        await database_1.default.query(`UPDATE Questions SET ${fields.join(', ')} WHERE question_id = ?`, values);
    }
    async hasPracticeHistory(question_id) {
        const [uqsRows] = await database_1.default.query('SELECT COUNT(*) as total FROM User_question_status WHERE question_id = ?', [question_id]);
        const [saRows] = await database_1.default.query('SELECT COUNT(*) as total FROM Session_answers WHERE question_id = ?', [question_id]);
        return (uqsRows[0].total > 0) || (saRows[0].total > 0);
    }
    async delete(question_id) {
        await database_1.default.query('DELETE FROM Questions WHERE question_id = ?', [question_id]);
    }
    async getUserQuestionStatus(user_id, question_ids) {
        if (question_ids.length === 0)
            return [];
        const placeholders = question_ids.map(() => '?').join(',');
        const [rows] = await database_1.default.query(`SELECT * FROM User_question_status WHERE user_id = ? AND question_id IN (${placeholders})`, [user_id, ...question_ids]);
        return rows;
    }
    async upsertUserQuestionStatus(user_id, question_id, is_correct) {
        await database_1.default.query(`INSERT INTO User_question_status (user_id, question_id, is_latest_correct, last_practiced, correct_count, wrong_count)
       VALUES (?, ?, ?, NOW(), ?, ?)
       ON DUPLICATE KEY UPDATE
         is_latest_correct = VALUES(is_latest_correct),
         last_practiced = NOW(),
         correct_count = correct_count + VALUES(correct_count),
         wrong_count = wrong_count + VALUES(wrong_count)`, [user_id, question_id, is_correct, is_correct ? 1 : 0, is_correct ? 0 : 1]);
    }
    async countBySubject(subject_id) {
        const [rows] = await database_1.default.query('SELECT COUNT(*) as total FROM Questions WHERE subject_id = ?', [subject_id]);
        return rows[0].total;
    }
}
exports.QuestionDAO = QuestionDAO;
exports.questionDAO = new QuestionDAO();
//# sourceMappingURL=QuestionDAO.js.map