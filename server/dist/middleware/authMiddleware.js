"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticate = void 0;
const AuthService_1 = require("../services/AuthService");
//kiem tra dang nhap
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
        return;
    }
    //decode token
    try {
        const token = authHeader.split(' ')[1];
        const payload = AuthService_1.authService.verifyToken(token);
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};
exports.authenticate = authenticate;
//kiem tra quyen han admin
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        return;
    }
    //la admin, cho phep thuc hien
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=authMiddleware.js.map