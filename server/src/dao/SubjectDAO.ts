import pool from '../config/database';
import { SubjectRow } from '../models/Subject';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class SubjectDAO {
  // Lấy danh sách tất cả môn học
  async findAll(): Promise<SubjectRow[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT s.subject_id, s.subject_name, COUNT(DISTINCT c.chapter_id) as total_chapter,
                s.description, COUNT(DISTINCT q.question_id) as question_count
         FROM Subjects s
         LEFT JOIN Chapters c ON s.subject_id = c.subject_id
         LEFT JOIN Questions q ON s.subject_id = q.subject_id
         GROUP BY s.subject_id
         ORDER BY s.subject_id`
    );
    return rows as SubjectRow[];
  }

  //Tìm môn học theo id
  async findById(subject_id: number): Promise<SubjectRow | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT s.subject_id, s.subject_name, COUNT(c.chapter_id) as total_chapter, s.description
         FROM Subjects s
         LEFT JOIN Chapters c ON s.subject_id = c.subject_id
         WHERE s.subject_id = ?
         GROUP BY s.subject_id`, [subject_id]
    );
    return rows.length > 0 ? (rows[0] as SubjectRow) : null;
  }

  //Thêm mới môn hoc
  async create(data: { subject_name: string; total_chapter?: number; description?: string }): Promise<number> {
    const totalChapter = Math.max(0, Number(data.total_chapter) || 0);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query<ResultSetHeader>(
          'INSERT INTO Subjects (subject_name, total_chapter, description) VALUES (?, ?, ?)',
          [data.subject_name, totalChapter, data.description || null]
      );

      for (let i = 1; i <= totalChapter; i++) {
        await conn.query(
            'INSERT INTO Chapters (subject_id, chapter_name, order_index) VALUES (?, ?, ?)',
            [result.insertId, `Chương ${i}`, i]
        );
      }

      await conn.commit();
      return result.insertId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  //Chỉnh sửa môn học theo id
  async update(subject_id: number, data: { subject_name?: string; total_chapter?: number; description?: string }): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

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
      if (fields.length > 0) {
        values.push(subject_id);
        await conn.query(`UPDATE Subjects
                          SET ${fields.join(', ')}
                          WHERE subject_id = ?`, values);
      }

      if (data.total_chapter !== undefined) {
        const targetTotal = Math.max(0, Number(data.total_chapter) || 0);
        const [chapterRows] = await conn.query<RowDataPacket[]>(
            'SELECT * FROM Chapters WHERE subject_id = ? ORDER BY order_index, chapter_id',
            [subject_id]
        );
        const chapters = chapterRows as { chapter_id: number; chapter_name: string; order_index: number | null }[];

        if (targetTotal > chapters.length) {
          for (let i = chapters.length + 1; i <= targetTotal; i++) {
            await conn.query(
                'INSERT INTO Chapters (subject_id, chapter_name, order_index) VALUES (?, ?, ?)',
                [subject_id, `Chương ${i}`, i]
            );
          }
        }

        if (targetTotal < chapters.length) {
          const removedChapters = chapters.slice(targetTotal);
          const removedIds = removedChapters.map(c => c.chapter_id);
          const placeholders = removedIds.map(() => '?').join(',');
          const [questionRows] = await conn.query<RowDataPacket[]>(
              `SELECT COUNT(*) as total FROM Questions WHERE chapter_id IN (${placeholders})`,
              removedIds
          );
          const questionTotal = Number((questionRows[0] as { total: number }).total);

          if (questionTotal > 0) {
            const names = removedChapters.map(c => c.chapter_name).join(', ');
            throw new Error(`Không thể giảm tổng số chương vì ${names} đang có câu hỏi`);
          }

          await conn.query(`DELETE FROM Chapters WHERE chapter_id IN (${placeholders})`, removedIds);
        }

        const [remainingRows] = await conn.query<RowDataPacket[]>(
            'SELECT chapter_id FROM Chapters WHERE subject_id = ? ORDER BY order_index, chapter_id',
            [subject_id]
        );
        for (let i = 0; i < remainingRows.length; i++) {
          await conn.query('UPDATE Chapters SET order_index = ? WHERE chapter_id = ?', [i + 1, remainingRows[i].chapter_id]);
        }

        await conn.query('UPDATE Subjects SET total_chapter = ? WHERE subject_id = ?', [targetTotal, subject_id]);
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  //Xoá môn học theo íd
  async delete(subject_id: number): Promise<void> {
    await pool.query('DELETE FROM Subjects WHERE subject_id = ?', [subject_id]);
  }
}

export const subjectDAO = new SubjectDAO();
