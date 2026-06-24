"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserDAO_1 = require("../dao/UserDAO");
const User_1 = require("../models/User");
const UserDTO_1 = require("../dto/UserDTO");
const JWT_SECRET = process.env.JWT_SECRET || 'eduquiz_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
class AuthService {
    async register(data) {
        const errors = (0, UserDTO_1.validateCreateUser)(data);
        if (errors.length > 0)
            throw new Error(errors.join('; '));
        const existingUser = await UserDAO_1.userDAO.findByUsername(data.user_name);
        if (existingUser)
            throw new Error('Tên đăng nhập đã tồn tại');
        const existingEmail = await UserDAO_1.userDAO.findByEmail(data.email);
        if (existingEmail)
            throw new Error('Email đã được sử dụng');
        const password_hash = await bcrypt_1.default.hash(data.password, 10);
        const user_id = await UserDAO_1.userDAO.create({
            user_name: data.user_name,
            email: data.email,
            password_hash,
            full_name: data.full_name,
        });
        const userRow = await UserDAO_1.userDAO.findById(user_id);
        if (!userRow)
            throw new Error('Tạo tài khoản thất bại');
        const userModel = User_1.UserModel.fromRow(userRow);
        const token = this.generateToken(userModel.getUserId(), userModel.getRole());
        return { user: userModel.toPublicJSON(), token };
    }
    async login(identifier, password) {
        const userRow = await UserDAO_1.userDAO.findByUsernameOrEmail(identifier);
        if (!userRow)
            throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
        const valid = await bcrypt_1.default.compare(password, userRow.password_hash);
        if (!valid)
            throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
        const userModel = User_1.UserModel.fromRow(userRow);
        const token = this.generateToken(userModel.getUserId(), userModel.getRole());
        return { user: userModel.toPublicJSON(), token };
    }
    async getProfile(user_id) {
        const userRow = await UserDAO_1.userDAO.findById(user_id);
        if (!userRow)
            throw new Error('Người dùng không tồn tại');
        return User_1.UserModel.fromRow(userRow).toPublicJSON();
    }
    async changePassword(user_id, old_password, new_password) {
        const userRow = await UserDAO_1.userDAO.findById(user_id);
        if (!userRow)
            throw new Error('Người dùng không tồn tại');
        const valid = await bcrypt_1.default.compare(old_password, userRow.password_hash);
        if (!valid)
            throw new Error('Mật khẩu cũ không đúng');
        if (new_password.length < 6)
            throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
        const password_hash = await bcrypt_1.default.hash(new_password, 10);
        await UserDAO_1.userDAO.update(user_id, { password_hash });
    }
    generateToken(user_id, role) {
        return jsonwebtoken_1.default.sign({ user_id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
    verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=AuthService.js.map