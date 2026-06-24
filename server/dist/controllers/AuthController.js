"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
class AuthController {
    async register(req, res) {
        try {
            // Nếu thành công, trả về status 201 (Created) cùng dữ liệu user vừa tạo
            const result = await AuthService_1.authService.register(req.body);
            res.status(201).json({ success: true, data: result });
        }
        catch (err) {
            // Nếu có lỗi, trả về status 400 (Bad Request) và nội dung lỗi
            res.status(400).json({ success: false, message: err.message });
        }
    }
    async login(req, res) {
        try {
            // Lấy username/email và password từ body của request
            const { identifier, password } = req.body;
            // ktra nếu thiếu một trong hai thông tin
            if (!identifier || !password) {
                res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
                return;
            }
            // Gọi service login để kiểm tra thông tin
            const result = await AuthService_1.authService.login(identifier, password);
            // Trả về đăng nhập thành công
            res.json({ success: true, data: result });
        }
        catch (err) {
            //lỗi đăng nhập
            res.status(401).json({ success: false, message: err.message });
        }
    }
    async getProfile(req, res) {
        try {
            const user_id = req.user?.user_id;
            if (!user_id) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const user = await AuthService_1.authService.getProfile(user_id);
            res.json({ success: true, data: user });
        }
        catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    }
    async changePassword(req, res) {
        try {
            const user_id = req.user?.user_id;
            if (!user_id) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const { old_password, new_password } = req.body;
            await AuthService_1.authService.changePassword(user_id, old_password, new_password);
            res.json({ success: true, message: 'Đổi mật khẩu thành công' });
        }
        catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=AuthController.js.map