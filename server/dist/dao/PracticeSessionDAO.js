"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.practiceSessionDAO = exports.PracticeSessionDAO = void 0;
const database_1 = __importDefault(require("../config/database"));
class PracticeSessionDAO {
    //tao phien luyen tap moi
    async create(data) {
        const [result] = await database_1.default.query(`INSERT INTO Practice_sessions (user_id, subject_id, mode, total_questions, duration, start_time)
         VALUES (?, ?, ?, ?, ?, NOW())`, [data.user_id, data.subject_id, data.mode, data.total_questions, data.duration]);
        return result.insertId;
    }
    //luu dap an
    async saveAnswers(session_id, answers) {
        if (answers.length === 0)
            return;
        const values = answers.map(a => [session_id, a.question_id, a.user_ans, a.is_correct]);
        await database_1.default.query(`INSERT INTO Session_answers (session_id, question_id, user_ans, is_correct) 
     VALUES ? 
     ON DUPLICATE KEY UPDATE 
        user_ans = VALUES(user_ans), 
        is_correct = VALUES(is_correct)`, [values]);
    }
    //nop bai
    async submitSession(session_id, data) {
        await database_1.default.query('UPDATE Practice_sessions SET submit_time = ?, score = ?, correct_count = ? WHERE session_id = ?', [data.submit_time, data.score, data.correct_count, session_id]);
    }
    //tim lich su phien lam bai theo id
    async findById(session_id) {
        const [rows] = await database_1.default.query(`SELECT ps.*, s.subject_name FROM Practice_sessions ps
       LEFT JOIN Subjects s ON ps.subject_id = s.subject_id
       WHERE ps.session_id = ?`, [session_id]);
        return rows.length > 0 ? rows[0] : null;
    }
    //tim lich su luyen tap theo nguoi dung
    async findByUser(user_id, filters) {
        let sql = `SELECT ps.*, s.subject_name FROM Practice_sessions ps
               LEFT JOIN Subjects s ON ps.subject_id = s.subject_id
               WHERE ps.user_id = ?`;
        const params = [user_id];
        //loc theo mon hoc
        if (filters?.subject_id) {
            sql += ' AND ps.subject_id = ?';
            params.push(filters.subject_id);
        }
        //limit hien thi moi trang 10 dong
        const limit = filters?.limit || 10;
        const page = filters?.page || 1;
        const [countRows] = await database_1.default.query(`SELECT COUNT(*) as total FROM Practice_sessions WHERE user_id = ?${filters?.subject_id ? ' AND subject_id = ?' : ''}`, filters?.subject_id ? [user_id, filters.subject_id] : [user_id]);
        const total = countRows[0].total;
        //sap xep theo thoi  moi nhat
        sql += ' ORDER BY ps.start_time DESC LIMIT ? OFFSET ?';
        params.push(limit, (page - 1) * limit);
        const [rows] = await database_1.default.query(sql, params);
        return { sessions: rows, total };
    }
    //lay dap an chi tiet 1 phien cu the bang id
    async getSessionAnswers(session_id) {
        const [rows] = await database_1.default.query('SELECT * FROM Session_answers WHERE session_id = ?', [session_id]);
        return rows;
    }
    //
    async getSessionQuestionsForInit(session_id) {
        const [rows] = await database_1.default.query('SELECT question_id FROM Session_answers WHERE session_id = ? ORDER BY question_id', [session_id]);
        return rows.map(r => r.question_id);
    }
    //// Lấy thống kê nhanh cho một môn học
    async getStatsBySubject(subject_id) {
        const [rows] = await database_1.default.query(`SELECT COUNT(DISTINCT user_id) as total_students, COUNT(*) as total_sessions, AVG(score) as avg_score
       FROM Practice_sessions WHERE subject_id = ? AND score IS NOT NULL`, [subject_id]);
        return rows[0];
    }
    /// Lấy điểm của user theo môn học de ve bieu do
    async getScoreHistory(user_id, subject_id) {
        const [rows] = await database_1.default.query(`SELECT submit_time, score FROM Practice_sessions
       WHERE user_id = ? AND subject_id = ? AND score IS NOT NULL
       ORDER BY submit_time ASC LIMIT 20`, [user_id, subject_id]);
        return rows;
    }
    /// Bảng xếp hạng sinh viên (top N theo số lượt luyện tập)
    async getLeaderboard(subject_id, limit = 20) {
        const params = [];
        let where = 'WHERE ps.score IS NOT NULL';
        if (subject_id) {
            where += ' AND ps.subject_id = ?';
            params.push(subject_id);
        }
        params.push(limit);
        const [rows] = await database_1.default.query(`SELECT u.user_id, u.user_name, u.full_name,
              COUNT(ps.session_id) AS total_sessions,
              AVG(ps.score) AS avg_score,
              MAX(ps.score) AS best_score
       FROM Practice_sessions ps
       JOIN Users u ON ps.user_id = u.user_id
       ${where}
       GROUP BY u.user_id, u.user_name, u.full_name
       ORDER BY total_sessions DESC, avg_score DESC
       LIMIT ?`, params);
        return rows;
    }
}
exports.PracticeSessionDAO = PracticeSessionDAO;
exports.practiceSessionDAO = new PracticeSessionDAO();
//# sourceMappingURL=PracticeSessionDAO.js.map