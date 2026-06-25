import pool from '../config/database';
import { ChapterRow } from '../models/Chapter';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class ChapterDAO {
    // Định nghĩa một hàm bất đồng bộ tên là 'getChaptersBySubject'.
    // Tham số đầu vào là 'subject_id', kiểu số (number).
    // Hàm này trả về một 'Promise', chứa một mảng dạng 'ChapterRow[]'.
    async getChaptersBySubject(subject_id: number): Promise<ChapterRow[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            //'<RowDataPacket[]>' là định kiểu của thư viện mysql2, rằng dữ liệu thô trả về từ DB sẽ là một mảng các gói dữ liệu hàng.
            'SELECT * FROM Chapters WHERE subject_id = ? ORDER BY order_index', [subject_id]
        );
        return rows as ChapterRow[];
    }
    // result[0] -> Mảng các record (Dữ liệu thực tế)
    // [{ id: 1, title: 'Chương 1', subject_id: 10 },
    //   { id: 2, title: 'Chương 2', subject_id: 10 }]
    // result[1] -> Mảng metadata (Thông tin cột)
    // [FieldPacket { name: 'id', columnLength: 11, type: 3, ... },
    //  FieldPacket { name: 'title', columnLength: 255, type: 253, ... },
    //  FieldPacket { name: 'subject_id', columnLength: 11, type: 3, ... }]

    async createChapter(data: { subject_id: number; chapter_name: string; order_index?: number }): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO Chapters (subject_id, chapter_name, order_index) VALUES (?, ?, ?)',
            [data.subject_id, data.chapter_name, data.order_index || null]
        );
        return result.insertId;
    }

    async updateChapter(chapter_id: number, data: { chapter_name: string }): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE Chapters SET chapter_name = ? WHERE chapter_id = ?',
            [data.chapter_name, chapter_id]
        );
        return result.affectedRows > 0;
    }

    async getDifficultyLevels(): Promise<{ level_id: number; level_name: string }[]> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Difficulty_levels');
        return rows as { level_id: number; level_name: string }[];
    }

    async getQuestionTypes(): Promise<{ type_id: number; type_name: string }[]> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Question_type');
        return rows as { type_id: number; type_name: string }[];
    }
}
export const chapterDAO = new ChapterDAO();