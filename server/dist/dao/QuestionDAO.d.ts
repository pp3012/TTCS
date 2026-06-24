import { QuestionRow } from '../models/Question';
import { UserQuestionStatusRow } from '../models/UserStats';
export declare class QuestionDAO {
    private readonly selectJoin;
    findById(question_id: number): Promise<QuestionRow | null>;
    findBySubject(subject_id: number, filters?: {
        chapter_id?: number;
        level_id?: number;
        type_id?: number;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        questions: QuestionRow[];
        total: number;
    }>;
    findRandomBySubject(subject_id: number, count: number, chapter_id?: number): Promise<QuestionRow[]>;
    findByIds(ids: number[]): Promise<QuestionRow[]>;
    findBySubjectGrouped(subject_id: number): Promise<QuestionRow[]>;
    create(data: {
        subject_id: number;
        chapter_id?: number;
        level_id?: number;
        type_id?: number;
        content: string;
        option_a: string;
        option_b: string;
        option_c: string;
        option_d: string;
        correct_option: string;
        explanation?: string;
    }): Promise<number>;
    update(question_id: number, data: Partial<{
        chapter_id: number;
        level_id: number;
        type_id: number;
        content: string;
        option_a: string;
        option_b: string;
        option_c: string;
        option_d: string;
        correct_option: string;
        explanation: string;
    }>): Promise<void>;
    hasPracticeHistory(question_id: number): Promise<boolean>;
    delete(question_id: number): Promise<void>;
    getUserQuestionStatus(user_id: number, question_ids: number[]): Promise<UserQuestionStatusRow[]>;
    upsertUserQuestionStatus(user_id: number, question_id: number, is_correct: boolean): Promise<void>;
    countBySubject(subject_id: number): Promise<number>;
}
export declare const questionDAO: QuestionDAO;
//# sourceMappingURL=QuestionDAO.d.ts.map