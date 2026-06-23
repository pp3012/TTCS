import pool from '../config/database';
import { QuestionRow } from '../models/Question';
import { UserQuestionStatusRow } from '../models/UserStats';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class QuestionDAO {
  private readonly selectJoin = `
    SELECT q.*, s.subject_name, c.chapter_name, dl.level_name, qt.type_name
    FROM Questions q
    LEFT JOIN Subjects s ON q.subject_id = s.subject_id
    LEFT JOIN Chapters c ON q.chapter_id = c.chapter_id
    LEFT JOIN Difficulty_levels dl ON q.level_id = dl.level_id
    LEFT JOIN Question_type qt ON q.type_id = qt.type_id
  `;

  async findById(question_id: number): Promise<QuestionRow | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `${this.selectJoin} WHERE q.question_id = ?`, [question_id]
    );
    return rows.length > 0 ? (rows[0] as QuestionRow) : null;
  }

  async findBySubject(subject_id: number, filters?: {
    chapter_id?: number; level_id?: number; type_id?: number;
    search?: string;
    page?: number; limit?: number;
  }): Promise<{ questions: QuestionRow[]; total: number }> {
    const conditions = ['q.subject_id = ?'];
    const params: unknown[] = [subject_id];

    if (filters?.chapter_id) { conditions.push('q.chapter_id = ?'); params.push(filters.chapter_id); }
    if (filters?.level_id) { conditions.push('q.level_id = ?'); params.push(filters.level_id); }
    if (filters?.type_id) { conditions.push('q.type_id = ?'); params.push(filters.type_id); }
    if (filters?.search?.trim()) {
      const like = `%${filters.search.trim()}%`;
      conditions.push('(q.content LIKE ? OR c.chapter_name LIKE ? OR dl.level_name LIKE ? OR qt.type_name LIKE ?)');
      params.push(like, like, like, like);
    }

    const whereSql = ` WHERE ${conditions.join(' AND ')}`;
    let sql = `${this.selectJoin}${whereSql}`;
    const countSql = `
      SELECT COUNT(*) as total
      FROM Questions q
      LEFT JOIN Chapters c ON q.chapter_id = c.chapter_id
      LEFT JOIN Difficulty_levels dl ON q.level_id = dl.level_id
      LEFT JOIN Question_type qt ON q.type_id = qt.type_id
      ${whereSql}
    `;
    const countParams = [...params];
    const [countRows] = await pool.query<RowDataPacket[]>(countSql, countParams);
    const total = (countRows[0] as { total: number }).total;

    sql += ' ORDER BY q.question_id';
    if (filters?.limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(filters.limit);
      params.push(((filters.page || 1) - 1) * filters.limit);
    }

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    return { questions: rows as QuestionRow[], total };
  }

  async findRandomBySubject(subject_id: number, count: number, chapter_id?: number): Promise<QuestionRow[]> {
    let sql = `${this.selectJoin} WHERE q.subject_id = ?`;
    const params: unknown[] = [subject_id];
    if (chapter_id) {
      sql += ' AND q.chapter_id = ?';
      params.push(chapter_id);
    }
    sql += ' ORDER BY RAND() LIMIT ?';
    params.push(count);

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    return rows as QuestionRow[];
  }

  async findByIds(ids: number[]): Promise<QuestionRow[]> {
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const [rows] = await pool.query<RowDataPacket[]>(
      `${this.selectJoin} WHERE q.question_id IN (${placeholders})`, ids
    );
    return rows as QuestionRow[];
  }

  async findBySubjectGrouped(subject_id: number): Promise<QuestionRow[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `${this.selectJoin} WHERE q.subject_id = ? ORDER BY q.chapter_id, q.level_id`, [subject_id]
    );
    return rows as QuestionRow[];
  }

  async create(data: {
    subject_id: number; chapter_id?: number; level_id?: number; type_id?: number;
    content: string; option_a: string; option_b: string; option_c: string; option_d: string;
    correct_option: string; explanation?: string;
  }): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO Questions (subject_id, chapter_id, level_id, type_id, content, option_a, option_b, option_c, option_d, correct_option, explanation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.subject_id, data.chapter_id || null, data.level_id || null, data.type_id || null,
      data.content, data.option_a, data.option_b, data.option_c, data.option_d,
      data.correct_option, data.explanation || null]
    );
    return result.insertId;
  }

  async update(question_id: number, data: Partial<{
    chapter_id: number; level_id: number; type_id: number;
    content: string; option_a: string; option_b: string; option_c: string; option_d: string;
    correct_option: string; explanation: string;
  }>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    const allowed = ['chapter_id', 'level_id', 'type_id', 'content', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'explanation'];
    for (const key of allowed) {
      if (key in data) {
        let val = (data as Record<string, unknown>)[key];
        // Cast 0 to null for foreign keys so MySQL doesn't throw constraint fails
        if (['chapter_id', 'level_id', 'type_id'].includes(key) && (val === 0 || val === '0')) {
          val = null;
        }
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }
    if (fields.length === 0) return;
    values.push(question_id);
    await pool.query(`UPDATE Questions SET ${fields.join(', ')} WHERE question_id = ?`, values);
  }

  async hasPracticeHistory(question_id: number): Promise<boolean> {
    const [uqsRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM User_question_status WHERE question_id = ?', [question_id]
    );
    const [saRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM Session_answers WHERE question_id = ?', [question_id]
    );
    return (uqsRows[0].total > 0) || (saRows[0].total > 0);
  }

  async delete(question_id: number): Promise<void> {
    await pool.query('DELETE FROM Questions WHERE question_id = ?', [question_id]);
  }

  async getUserQuestionStatus(user_id: number, question_ids: number[]): Promise<UserQuestionStatusRow[]> {
    if (question_ids.length === 0) return [];
    const placeholders = question_ids.map(() => '?').join(',');
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM User_question_status WHERE user_id = ? AND question_id IN (${placeholders})`,
      [user_id, ...question_ids]
    );
    return rows as UserQuestionStatusRow[];
  }

  async upsertUserQuestionStatus(user_id: number, question_id: number, is_correct: boolean): Promise<void> {
    await pool.query(
      `INSERT INTO User_question_status (user_id, question_id, is_latest_correct, last_practiced, correct_count, wrong_count)
       VALUES (?, ?, ?, NOW(), ?, ?)
       ON DUPLICATE KEY UPDATE
         is_latest_correct = VALUES(is_latest_correct),
         last_practiced = NOW(),
         correct_count = correct_count + VALUES(correct_count),
         wrong_count = wrong_count + VALUES(wrong_count)`,
      [user_id, question_id, is_correct, is_correct ? 1 : 0, is_correct ? 0 : 1]
    );
  }

  async countBySubject(subject_id: number): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM Questions WHERE subject_id = ?', [subject_id]
    );
    return (rows[0] as { total: number }).total;
  }
}

export const questionDAO = new QuestionDAO();
