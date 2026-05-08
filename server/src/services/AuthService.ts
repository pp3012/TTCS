import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userDAO } from '../dao/UserDAO';
import { UserModel } from '../models/User';
import { CreateUserDTO, validateCreateUser } from '../dto/UserDTO';

const JWT_SECRET = process.env.JWT_SECRET || 'eduquiz_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthService {
  async register(data: CreateUserDTO): Promise<{ user: object; token: string }> {
    const errors = validateCreateUser(data);
    if (errors.length > 0) throw new Error(errors.join('; '));

    const existingUser = await userDAO.findByUsername(data.user_name);
    if (existingUser) throw new Error('Tên đăng nhập đã tồn tại');

    const existingEmail = await userDAO.findByEmail(data.email);
    if (existingEmail) throw new Error('Email đã được sử dụng');

    const password_hash = await bcrypt.hash(data.password, 10);
    const user_id = await userDAO.create({
      user_name: data.user_name,
      email: data.email,
      password_hash,
      full_name: data.full_name,
    });

    const userRow = await userDAO.findById(user_id);
    if (!userRow) throw new Error('Tạo tài khoản thất bại');

    const userModel = UserModel.fromRow(userRow);
    const token = this.generateToken(userModel.getUserId(), userModel.getRole());

    return { user: userModel.toPublicJSON(), token };
  }

  async login(identifier: string, password: string): Promise<{ user: object; token: string }> {
    const userRow = await userDAO.findByUsernameOrEmail(identifier);
    if (!userRow) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');

    const valid = await bcrypt.compare(password, userRow.password_hash);
    if (!valid) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');

    const userModel = UserModel.fromRow(userRow);
    const token = this.generateToken(userModel.getUserId(), userModel.getRole());

    return { user: userModel.toPublicJSON(), token };
  }

  async getProfile(user_id: number): Promise<object> {
    const userRow = await userDAO.findById(user_id);
    if (!userRow) throw new Error('Người dùng không tồn tại');
    return UserModel.fromRow(userRow).toPublicJSON();
  }

  async changePassword(user_id: number, old_password: string, new_password: string): Promise<void> {
    const userRow = await userDAO.findById(user_id);
    if (!userRow) throw new Error('Người dùng không tồn tại');

    const valid = await bcrypt.compare(old_password, userRow.password_hash);
    if (!valid) throw new Error('Mật khẩu cũ không đúng');

    if (new_password.length < 6) throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
    const password_hash = await bcrypt.hash(new_password, 10);
    await userDAO.update(user_id, { password_hash });
  }

  private generateToken(user_id: number, role: string): string {
    return jwt.sign({ user_id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  }

  verifyToken(token: string): { user_id: number; role: string } {
    return jwt.verify(token, JWT_SECRET) as { user_id: number; role: string };
  }
}

export const authService = new AuthService();
