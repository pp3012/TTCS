"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = exports.AdminController = void 0;
const UserDAO_1 = require("../dao/UserDAO");
const User_1 = require("../models/User");
const StatisticsService_1 = require("../services/StatisticsService");
class AdminController {
    async getUsers(req, res) {
        try {
            const { page = 1, limit = 20, search } = req.query;
            const result = await UserDAO_1.userDAO.findAll(Number(page), Number(limit), search);
            const users = result.users.map(u => User_1.UserModel.fromRow(u).toPublicJSON());
            res.json({ success: true, data: users, total: result.total });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async getUserById(req, res) {
        try {
            const userRow = await UserDAO_1.userDAO.findById(Number(req.params.id));
            if (!userRow) {
                res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
                return;
            }
            res.json({ success: true, data: User_1.UserModel.fromRow(userRow).toPublicJSON() });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async updateUser(req, res) {
        try {
            const user_id = Number(req.params.id);
            const { email, full_name } = req.body;
            await UserDAO_1.userDAO.update(user_id, { email, full_name });
            const userRow = await UserDAO_1.userDAO.findById(user_id);
            res.json({ success: true, data: User_1.UserModel.fromRow(userRow).toPublicJSON() });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async deleteUser(req, res) {
        try {
            const user_id = Number(req.params.id);
            if (user_id === req.user?.user_id) {
                res.status(400).json({ success: false, message: 'Không thể xóa tài khoản đang đăng nhập' });
                return;
            }
            const hasHistory = await UserDAO_1.userDAO.hasPracticeHistory(user_id);
            if (hasHistory) {
                res.status(400).json({ success: false, message: 'Không thể xóa người dùng này vì đã có lịch sử luyện tập' });
                return;
            }
            await UserDAO_1.userDAO.delete(user_id);
            res.json({ success: true, message: 'Đã xóa người dùng' });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async getSubjectStats(req, res) {
        try {
            const stats = await StatisticsService_1.statisticsService.getAdminSubjectStats();
            res.json({ success: true, data: stats });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    async getUserStats(req, res) {
        try {
            const { user_id, subject_id, limit } = req.query;
            if (user_id && subject_id) {
                const stats = await StatisticsService_1.statisticsService.getUserStatsBySubject(Number(user_id), Number(subject_id));
                res.json({ success: true, data: stats });
            }
            else if (user_id) {
                const stats = await StatisticsService_1.statisticsService.getUserStats(Number(user_id));
                res.json({ success: true, data: stats });
            }
            else {
                // Leaderboard mode: top users by sessions
                const stats = await StatisticsService_1.statisticsService.getLeaderboard(subject_id ? Number(subject_id) : undefined, limit ? Number(limit) : 20);
                res.json({ success: true, data: stats });
            }
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}
exports.AdminController = AdminController;
exports.adminController = new AdminController();
//# sourceMappingURL=AdminController.js.map