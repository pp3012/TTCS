import { PracticeSessionRow, SessionAnswerRow } from '../models/PracticeSession';
export declare class PracticeSessionDAO {
    create(data: {
        user_id: number;
        subject_id: number;
        mode: string;
        total_questions: number;
        duration: number;
    }): Promise<number>;
    saveAnswers(session_id: number, answers: {
        question_id: number;
        user_ans: string | null;
        is_correct: boolean;
    }[]): Promise<void>;
    submitSession(session_id: number, data: {
        submit_time: Date;
        score: number;
        correct_count: number;
    }): Promise<void>;
    findById(session_id: number): Promise<PracticeSessionRow | null>;
    findByUser(user_id: number, filters?: {
        subject_id?: number;
        page?: number;
        limit?: number;
    }): Promise<{
        sessions: PracticeSessionRow[];
        total: number;
    }>;
    getSessionAnswers(session_id: number): Promise<SessionAnswerRow[]>;
    getSessionQuestionsForInit(session_id: number): Promise<number[]>;
    getStatsBySubject(subject_id: number): Promise<{
        total_students: number;
        total_sessions: number;
        avg_score: number;
    }>;
    getScoreHistory(user_id: number, subject_id: number): Promise<{
        submit_time: Date;
        score: number;
    }[]>;
    getLeaderboard(subject_id?: number, limit?: number): Promise<{
        user_id: number;
        user_name: string;
        full_name: string;
        total_sessions: number;
        avg_score: number;
        best_score: number;
    }[]>;
}
export declare const practiceSessionDAO: PracticeSessionDAO;
//# sourceMappingURL=PracticeSessionDAO.d.ts.map