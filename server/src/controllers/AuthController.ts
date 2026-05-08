import { Request, Response } from 'express';
import { authService } from '../services/AuthService';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Nếu thành công, trả về status 201 (Created) cùng dữ liệu user vừa tạo
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err: unknown) {
      // Nếu có lỗi, trả về status 400 (Bad Request) và nội dung lỗi
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      // Lấy username/email và password từ body của request
      const { identifier, password } = req.body;
      // ktra nếu thiếu một trong hai thông tin
      if (!identifier || !password) {
        res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
        return;
      }
      // Gọi service login để kiểm tra thông tin
      const result = await authService.login(identifier, password);
      // Trả về đăng nhập thành công
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      //lỗi đăng nhập
      res.status(401).json({ success: false, message: (err as Error).message });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user_id = (req as Request & { user?: { user_id: number } }).user?.user_id;
      if (!user_id) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
      const user = await authService.getProfile(user_id);
      res.json({ success: true, data: user });
    } catch (err: unknown) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const user_id = (req as Request & { user?: { user_id: number } }).user?.user_id;
      if (!user_id) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
      const { old_password, new_password } = req.body;
      await authService.changePassword(user_id, old_password, new_password);
      res.json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (err: unknown) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }
}

export const authController = new AuthController();
