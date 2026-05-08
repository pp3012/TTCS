import pool from '../config/database';
import { PracticeSessionRow, SessionAnswerRow } from '../models/PracticeSession';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class PracticeSessionDAO {
  //tao phien luyen tap moi
  async create(data: {
    user_id: number; subject_id: number; mode: string;
    total_questions: number; duration: number;
  }): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO Practice_sessions (user_id, subject_id, mode, total_questions, duration, start_time)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [data.user_id, data.subject_id, data.mode, data.total_questions, data.duration]
    );
    return result.insertId;
  }

  //luu dap an
  async saveAnswers(session_id: number, answers: { question_id: number; user_ans: string | null; is_correct: boolean }[]): Promise<void> {
    if (answers.length === 0) return;

    const values = answers.map(a => [session_id, a.question_id, a.user_ans, a.is_correct]);

    await pool.query(
        `INSERT INTO Session_answers (session_id, question_id, user_ans, is_correct) 
     VALUES ? 
     ON DUPLICATE KEY UPDATE 
        user_ans = VALUES(user_ans), 
        is_correct = VALUES(is_correct)`,
        [values]
    );
  }

  //nop bai
  async submitSession(session_id: number, data: {
    submit_time: Date; score: number; correct_count: number;
  }): Promise<void> {
    await pool.query(
      'UPDATE Practice_sessions SET submit_time = ?, score = ?, correct_count = ? WHERE session_id = ?',
      [data.submit_time, data.score, data.correct_count, session_id]
    );
  }

  //tim lich su phien lam bai theo id
  async findById(session_id: number): Promise<PracticeSessionRow | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ps.*, s.subject_name FROM Practice_sessions ps
       LEFT JOIN Subjects s ON ps.subject_id = s.subject_id
       WHERE ps.session_id = ?`, [session_id]
    );
    return rows.length > 0 ? (rows[0] as PracticeSessionRow) : null;
  }

  //tim lich su luyen tap theo nguoi dung
  async findByUser(user_id: number, filters?: {
    subject_id?: number; page?: number; limit?: number;
  }): Promise<{ sessions: PracticeSessionRow[]; total: number }> {
    let sql = `SELECT ps.*, s.subject_name FROM Practice_sessions ps
               LEFT JOIN Subjects s ON ps.subject_id = s.subject_id
               WHERE ps.user_id = ?`;
    const params: unknown[] = [user_id];

    //loc theo mon hoc
    if (filters?.subject_id) { sql += ' AND ps.subject_id = ?'; params.push(filters.subject_id); }

    //limit hien thi moi trang 10 dong
    const limit = filters?.limit || 10;
    const page = filters?.page || 1;

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM Practice_sessions WHERE user_id = ?${filters?.subject_id ? ' AND subject_id = ?' : ''}`,
      filters?.subject_id ? [user_id, filters.subject_id] : [user_id]
    );
    const total = (countRows[0] as { total: number }).total;

    //sap xep theo thoi  moi nhat
    sql += ' ORDER BY ps.start_time DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    return { sessions: rows as PracticeSessionRow[], total };
  }

  //lay dap an chi tiet 1 phien cu the bang id
  async getSessionAnswers(session_id: number): Promise<SessionAnswerRow[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Session_answers WHERE session_id = ?', [session_id]
    );
    return rows as SessionAnswerRow[];
  }

  //
  async getSessionQuestionsForInit(session_id: number): Promise<number[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT question_id FROM Session_answers WHERE session_id = ? ORDER BY question_id', [session_id]
    );
    return (rows as { question_id: number }[]).map(r => r.question_id);
  }

  //// Lấy thống kê nhanh cho một môn học
  async getStatsBySubject(subject_id: number): Promise<{
    total_students: number; total_sessions: number; avg_score: number;
  }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT user_id) as total_students, COUNT(*) as total_sessions, AVG(score) as avg_score
       FROM Practice_sessions WHERE subject_id = ? AND score IS NOT NULL`, [subject_id]
    );
    return rows[0] as { total_students: number; total_sessions: number; avg_score: number };
  }

  /// Lấy điểm của user theo môn học de ve bieu do
  async getScoreHistory(user_id: number, subject_id: number): Promise<{ submit_time: Date; score: number }[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT submit_time, score FROM Practice_sessions
       WHERE user_id = ? AND subject_id = ? AND score IS NOT NULL
       ORDER BY submit_time ASC LIMIT 20`,
      [user_id, subject_id]
    );
    return rows as { submit_time: Date; score: number }[];
  }
}

export const practiceSessionDAO = new PracticeSessionDAO();
