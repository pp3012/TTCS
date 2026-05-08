import pool from '../config/database';
import { SubjectRow } from '../models/Subject';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class SubjectDAO {
  // Lấy danh sách tất cả môn học
  async findAll(): Promise<SubjectRow[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT s.*, COUNT(q.question_id) as question_count FROM Subjects s LEFT JOIN Questions q ON s.subject_id = q.subject_id GROUP BY s.subject_id ORDER BY s.subject_id'
    );
    return rows as SubjectRow[];
  }

  //Tìm môn học theo id
  async findById(subject_id: number): Promise<SubjectRow | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM Subjects WHERE subject_id = ?', [subject_id]
    );
    return rows.length > 0 ? (rows[0] as SubjectRow) : null;
  }

  //Thêm mới môn hoc
  async create(data: { subject_name: string; description?: string }): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO Subjects (subject_name, description) VALUES (?, ?)',
        [data.subject_name, data.description || null]
    );
    return result.insertId;
  }

  //Chỉnh sửa môn học theo id
  async update(subject_id: number, data: { subject_name?: string; description?: string }): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    if (data.subject_name) {
      fields.push('subject_name = ?');
      values.push(data.subject_name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (fields.length === 0) return;
    values.push(subject_id);
    await pool.query(`UPDATE Subjects
                      SET ${fields.join(', ')}
                      WHERE subject_id = ?`, values);
  }

  //Xoá môn học theo íd
  async delete(subject_id: number): Promise<void> {
    await pool.query('DELETE FROM Subjects WHERE subject_id = ?', [subject_id]);
  }
}

export const subjectDAO = new SubjectDAO();
