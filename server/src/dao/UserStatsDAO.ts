import pool from '../config/database';
import { UserStatsRow } from '../models/UserStats';
import { RowDataPacket } from 'mysql2/promise';

export class UserStatsDAO {
  async findByUserAndSubject(user_id: number, subject_id: number): Promise<UserStatsRow | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT us.*, s.subject_name FROM User_stats us
       LEFT JOIN Subjects s ON us.subject_id = s.subject_id
       WHERE us.user_id = ? AND us.subject_id = ?`,
      [user_id, subject_id]
    );
    return rows.length > 0 ? (rows[0] as UserStatsRow) : null;
  }

  async findAllByUser(user_id: number): Promise<UserStatsRow[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT us.*, s.subject_name FROM User_stats us
       LEFT JOIN Subjects s ON us.subject_id = s.subject_id
       WHERE us.user_id = ? ORDER BY us.subject_id`,
      [user_id]
    );
    return rows as UserStatsRow[];
  }

  async upsert(user_id: number, subject_id: number, data: {
    total_sessions?: number;
    overall_score?: number;
    chapter_accuracy?: Record<string, number>;
    difficulty_accuracy?: Record<string, number>;
    type_accuracy?: Record<string, number>;
  }): Promise<void> {
    const existing = await this.findByUserAndSubject(user_id, subject_id);
    if (!existing) {
      await pool.query(
        `INSERT INTO User_stats (user_id, subject_id, total_sessions, overall_score, chapter_accuracy, difficulty_accuracy, type_accuracy)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id, subject_id,
          data.total_sessions || 0,
          data.overall_score || 0,
          JSON.stringify(data.chapter_accuracy || {}),
          JSON.stringify(data.difficulty_accuracy || {}),
          JSON.stringify(data.type_accuracy || {}),
        ]
      );
    } else {
      const fields: string[] = [];
      const values: unknown[] = [];
      if (data.total_sessions !== undefined) { fields.push('total_sessions = ?'); values.push(data.total_sessions); }
      if (data.overall_score !== undefined) { fields.push('overall_score = ?'); values.push(data.overall_score); }
      if (data.chapter_accuracy !== undefined) { fields.push('chapter_accuracy = ?'); values.push(JSON.stringify(data.chapter_accuracy)); }
      if (data.difficulty_accuracy !== undefined) { fields.push('difficulty_accuracy = ?'); values.push(JSON.stringify(data.difficulty_accuracy)); }
      if (data.type_accuracy !== undefined) { fields.push('type_accuracy = ?'); values.push(JSON.stringify(data.type_accuracy)); }
      if (fields.length === 0) return;
      values.push(user_id, subject_id);
      await pool.query(`UPDATE User_stats SET ${fields.join(', ')} WHERE user_id = ? AND subject_id = ?`, values);
    }
  }
}

export const userStatsDAO = new UserStatsDAO();
