import pool from '../config/database';
import { ChapterRow } from '../models/Chapter';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class ChapterDAO {
    async getChaptersBySubject(subject_id: number): Promise<ChapterRow[]> {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM Chapters WHERE subject_id = ? ORDER BY order_index', [subject_id]
        );
        return rows as ChapterRow[];
    }

    async createChapter(data: { subject_id: number; chapter_name: string; order_index?: number }): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO Chapters (subject_id, chapter_name, order_index) VALUES (?, ?, ?)',
            [data.subject_id, data.chapter_name, data.order_index || null]
        );
        return result.insertId;
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