import { ChapterRow } from '../models/Chapter';
export declare class ChapterDAO {
    getChaptersBySubject(subject_id: number): Promise<ChapterRow[]>;
    createChapter(data: {
        subject_id: number;
        chapter_name: string;
        order_index?: number;
    }): Promise<number>;
    updateChapter(chapter_id: number, data: {
        chapter_name: string;
    }): Promise<boolean>;
    getDifficultyLevels(): Promise<{
        level_id: number;
        level_name: string;
    }[]>;
    getQuestionTypes(): Promise<{
        type_id: number;
        type_name: string;
    }[]>;
}
export declare const chapterDAO: ChapterDAO;
//# sourceMappingURL=ChapterDAO.d.ts.map