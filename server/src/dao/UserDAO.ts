import pool from '../config/database';
import { UserRow } from '../models/User';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class UserDAO {
  //tim user theo ten danh nhap
  async findByUsername(user_name: string): Promise<UserRow | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Users WHERE user_name = ?', [user_name]
    );
    return rows.length > 0 ? (rows[0] as UserRow) : null;
  }

  //tim user bang email
  async findByEmail(email: string): Promise<UserRow | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Users WHERE email = ?', [email]
    );
    return rows.length > 0 ? (rows[0] as UserRow) : null;
  }

  //tim user bang id
  async findById(user_id: number): Promise<UserRow | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Users WHERE user_id = ?', [user_id]
    );
    return rows.length > 0 ? (rows[0] as UserRow) : null;
  }

  //tim bang ten hoac mail
  async findByUsernameOrEmail(identifier: string): Promise<UserRow | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Users WHERE user_name = ? OR email = ?', [identifier, identifier]
    );
    return rows.length > 0 ? (rows[0] as UserRow) : null;
  }

  //them moi user
  async create(data: { user_name: string; email: string; password_hash: string; full_name?: string; role?: string }): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Users (user_name, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [data.user_name, data.email, data.password_hash, data.full_name || null, data.role || 'student']
    );
    return result.insertId;
  }

  //cap nhat tt user theo id
  async update(user_id: number, data: { email?: string; full_name?: string; password_hash?: string }): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    if (data.email) { fields.push('email = ?'); values.push(data.email); }
    if (data.full_name !== undefined) { fields.push('full_name = ?'); values.push(data.full_name); }
    if (data.password_hash) { fields.push('password_hash = ?'); values.push(data.password_hash); }
    if (fields.length === 0) return;
    values.push(user_id);
    await pool.query(`UPDATE Users SET ${fields.join(', ')} WHERE user_id = ?`, values);
  }

  async hasPracticeHistory(user_id: number): Promise<boolean> {
    const [psRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM Practice_sessions WHERE user_id = ?', [user_id]
    );
    const [uqsRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM User_question_status WHERE user_id = ?', [user_id]
    );
    const [usRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM User_stats WHERE user_id = ?', [user_id]
    );
    return (psRows[0].total > 0) || (uqsRows[0].total > 0) || (usRows[0].total > 0);
  }

  //xoa user theo id
  async delete(user_id: number): Promise<void> {
    await pool.query('DELETE FROM Users WHERE user_id = ?', [user_id]);
  }

  //lay ds tat ca user (co ho tro tim kiem)
  async findAll(page: number = 1, limit: number = 20, search?: string): Promise<{ users: UserRow[]; total: number }> {
    const offset = (page - 1) * limit;
    if (search) {
      const like = `%${search}%`;
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM Users WHERE user_name LIKE ? OR email LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [like, like, limit, offset]
      );
      const [countRows] = await pool.query<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM Users WHERE user_name LIKE ? OR email LIKE ?', [like, like]
      );
      return { users: rows as UserRow[], total: (countRows[0] as { total: number }).total };
    }
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Users ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]
    );
    const [countRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as total FROM Users');
    return { users: rows as UserRow[], total: (countRows[0] as { total: number }).total };
  }
}

export const userDAO = new UserDAO();
