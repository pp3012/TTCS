import { SubjectRow } from '../models/Subject';
export declare class SubjectDAO {
    findAll(): Promise<SubjectRow[]>;
    findById(subject_id: number): Promise<SubjectRow | null>;
    create(data: {
        subject_name: string;
        total_chapter?: number;
        description?: string;
    }): Promise<number>;
    update(subject_id: number, data: {
        subject_name?: string;
        total_chapter?: number;
        description?: string;
    }): Promise<void>;
    hasPracticeHistory(subject_id: number): Promise<boolean>;
    hasQuestions(subject_id: number): Promise<boolean>;
    delete(subject_id: number): Promise<void>;
    syncTotalChapter(subject_id: number): Promise<void>;
    findChaptersBySubject(subject_id: number): Promise<{
        chapter_id: number;
        chapter_name: string;
        order_index: number;
    }[]>;
}
export declare const subjectDAO: SubjectDAO;
//# sourceMappingURL=SubjectDAO.d.ts.map