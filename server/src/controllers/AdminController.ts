import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { userDAO } from '../dao/UserDAO';
import { UserModel } from '../models/User';
import { statisticsService } from '../services/StatisticsService';

type AuthRequest = Request & { user?: { user_id: number; role: string } };

export class AdminController {
  async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const result = await userDAO.findAll(Number(page), Number(limit), search as string | undefined);
      const users = result.users.map(u => UserModel.fromRow(u).toPublicJSON());
      res.json({ success: true, data: users, total: result.total });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }


  async getUserById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userRow = await userDAO.findById(Number(req.params.id));
      if (!userRow) { res.status(404).json({ success: false, message: 'Người dùng không tồn tại' }); return; }
      res.json({ success: true, data: UserModel.fromRow(userRow).toPublicJSON() });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user_id = Number(req.params.id);
      const { email, full_name } = req.body;
      await userDAO.update(user_id, { email, full_name });
      const userRow = await userDAO.findById(user_id);
      res.json({ success: true, data: UserModel.fromRow(userRow!).toPublicJSON() });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user_id = Number(req.params.id);
      if (user_id === req.user?.user_id) {
        res.status(400).json({ success: false, message: 'Không thể xóa tài khoản đang đăng nhập' });
        return;
      }
      const hasHistory = await userDAO.hasPracticeHistory(user_id);
      if (hasHistory) {
        res.status(400).json({ success: false, message: 'Không thể xóa người dùng này vì đã có lịch sử luyện tập' });
        return;
      }
      await userDAO.delete(user_id);
      res.json({ success: true, message: 'Đã xóa người dùng' });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async getSubjectStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await statisticsService.getAdminSubjectStats();
      res.json({ success: true, data: stats });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async getUserStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { user_id, subject_id, limit } = req.query;
      if (user_id && subject_id) {
        const stats = await statisticsService.getUserStatsBySubject(Number(user_id), Number(subject_id));
        res.json({ success: true, data: stats });
      } else if (user_id) {
        const stats = await statisticsService.getUserStats(Number(user_id));
        res.json({ success: true, data: stats });
      } else {
        // Leaderboard mode: top users by sessions
        const stats = await statisticsService.getLeaderboard(
          subject_id ? Number(subject_id) : undefined,
          limit ? Number(limit) : 20
        );
        res.json({ success: true, data: stats });
      }
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }
}

export const adminController = new AdminController();
