"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDAO = exports.UserDAO = void 0;
const database_1 = __importDefault(require("../config/database"));
class UserDAO {
    //tim user theo ten danh nhap
    async findByUsername(user_name) {
        const [rows] = await database_1.default.query('SELECT * FROM Users WHERE user_name = ?', [user_name]);
        return rows.length > 0 ? rows[0] : null;
    }
    //tim user bang email
    async findByEmail(email) {
        const [rows] = await database_1.default.query('SELECT * FROM Users WHERE email = ?', [email]);
        return rows.length > 0 ? rows[0] : null;
    }
    //tim user bang id
    async findById(user_id) {
        const [rows] = await database_1.default.query('SELECT * FROM Users WHERE user_id = ?', [user_id]);
        return rows.length > 0 ? rows[0] : null;
    }
    //tim bang ten hoac mail
    async findByUsernameOrEmail(identifier) {
        const [rows] = await database_1.default.query('SELECT * FROM Users WHERE user_name = ? OR email = ?', [identifier, identifier]);
        return rows.length > 0 ? rows[0] : null;
    }
    //them moi user
    async create(data) {
        const [result] = await database_1.default.query('INSERT INTO Users (user_name, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)', [data.user_name, data.email, data.password_hash, data.full_name || null, data.role || 'student']);
        return result.insertId;
    }
    //cap nhat tt user theo id
    async update(user_id, data) {
        const fields = [];
        const values = [];
        if (data.email) {
            fields.push('email = ?');
            values.push(data.email);
        }
        if (data.full_name !== undefined) {
            fields.push('full_name = ?');
            values.push(data.full_name);
        }
        if (data.password_hash) {
            fields.push('password_hash = ?');
            values.push(data.password_hash);
        }
        if (fields.length === 0)
            return;
        values.push(user_id);
        await database_1.default.query(`UPDATE Users SET ${fields.join(', ')} WHERE user_id = ?`, values);
    }
    async hasPracticeHistory(user_id) {
        const [psRows] = await database_1.default.query('SELECT COUNT(*) as total FROM Practice_sessions WHERE user_id = ?', [user_id]);
        const [uqsRows] = await database_1.default.query('SELECT COUNT(*) as total FROM User_question_status WHERE user_id = ?', [user_id]);
        const [usRows] = await database_1.default.query('SELECT COUNT(*) as total FROM User_stats WHERE user_id = ?', [user_id]);
        return (psRows[0].total > 0) || (uqsRows[0].total > 0) || (usRows[0].total > 0);
    }
    //xoa user theo id
    async delete(user_id) {
        await database_1.default.query('DELETE FROM Users WHERE user_id = ?', [user_id]);
    }
    //lay ds tat ca user (co ho tro tim kiem)
    async findAll(page = 1, limit = 20, search) {
        const offset = (page - 1) * limit;
        if (search) {
            const like = `%${search}%`;
            const [rows] = await database_1.default.query('SELECT * FROM Users WHERE user_name LIKE ? OR email LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?', [like, like, limit, offset]);
            const [countRows] = await database_1.default.query('SELECT COUNT(*) as total FROM Users WHERE user_name LIKE ? OR email LIKE ?', [like, like]);
            return { users: rows, total: countRows[0].total };
        }
        const [rows] = await database_1.default.query('SELECT * FROM Users ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
        const [countRows] = await database_1.default.query('SELECT COUNT(*) as total FROM Users');
        return { users: rows, total: countRows[0].total };
    }
}
exports.UserDAO = UserDAO;
exports.userDAO = new UserDAO();
//# sourceMappingURL=UserDAO.js.map