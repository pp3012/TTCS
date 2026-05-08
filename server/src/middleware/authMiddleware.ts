import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';

type AuthRequest = Request & { user?: { user_id: number; role: string } };

//kiem tra dang nhap
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
    return;
  }
  //decode token
  try {
    const token = authHeader.split(' ')[1];
    const payload = authService.verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};
//kiem tra quyen han admin
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    return;
  }
  //la admin, cho phep thuc hien
  next();
};
