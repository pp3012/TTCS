"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userStatsDAO = exports.UserStatsDAO = void 0;
const database_1 = __importDefault(require("../config/database"));
class UserStatsDAO {
    async findByUserAndSubject(user_id, subject_id) {
        const [rows] = await database_1.default.query(`SELECT us.*, s.subject_name FROM User_stats us
       LEFT JOIN Subjects s ON us.subject_id = s.subject_id
       WHERE us.user_id = ? AND us.subject_id = ?`, [user_id, subject_id]);
        return rows.length > 0 ? rows[0] : null;
    }
    async findAllByUser(user_id) {
        const [rows] = await database_1.default.query(`SELECT us.*, s.subject_name FROM User_stats us
       LEFT JOIN Subjects s ON us.subject_id = s.subject_id
       WHERE us.user_id = ? ORDER BY us.subject_id`, [user_id]);
        return rows;
    }
    async upsert(user_id, subject_id, data) {
        const existing = await this.findByUserAndSubject(user_id, subject_id);
        if (!existing) {
            await database_1.default.query(`INSERT INTO User_stats (user_id, subject_id, total_sessions, overall_score, chapter_accuracy, difficulty_accuracy, type_accuracy)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                user_id, subject_id,
                data.total_sessions || 0,
                data.overall_score || 0,
                JSON.stringify(data.chapter_accuracy || {}),
                JSON.stringify(data.difficulty_accuracy || {}),
                JSON.stringify(data.type_accuracy || {}),
            ]);
        }
        else {
            const fields = [];
            const values = [];
            if (data.total_sessions !== undefined) {
                fields.push('total_sessions = ?');
                values.push(data.total_sessions);
            }
            if (data.overall_score !== undefined) {
                fields.push('overall_score = ?');
                values.push(data.overall_score);
            }
            if (data.chapter_accuracy !== undefined) {
                fields.push('chapter_accuracy = ?');
                values.push(JSON.stringify(data.chapter_accuracy));
            }
            if (data.difficulty_accuracy !== undefined) {
                fields.push('difficulty_accuracy = ?');
                values.push(JSON.stringify(data.difficulty_accuracy));
            }
            if (data.type_accuracy !== undefined) {
                fields.push('type_accuracy = ?');
                values.push(JSON.stringify(data.type_accuracy));
            }
            if (fields.length === 0)
                return;
            values.push(user_id, subject_id);
            await database_1.default.query(`UPDATE User_stats SET ${fields.join(', ')} WHERE user_id = ? AND subject_id = ?`, values);
        }
    }
}
exports.UserStatsDAO = UserStatsDAO;
exports.userStatsDAO = new UserStatsDAO();
//# sourceMappingURL=UserStatsDAO.js.map