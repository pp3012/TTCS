export interface PracticeSessionRow {
    session_id: number;
    user_id: number;
    subject_id: number;
    mode: 'free' | 'personalized';
    total_questions: number;
    duration: number;
    start_time: Date | null;
    submit_time: Date | null;
    score: number | null;
    correct_count: number | null;
    subject_name?: string;
}
export declare class PracticeSessionModel {
    private session_id;
    private user_id;
    private subject_id;
    private mode;
    private total_questions;
    private duration;
    private start_time;
    private submit_time;
    private score;
    private correct_count;
    private subject_name?;
    private constructor();
    static fromRow(row: PracticeSessionRow): PracticeSessionModel;
    getSessionId(): number;
    getUserId(): number;
    getSubjectId(): number;
    toJSON(): {
        session_id: number;
        user_id: number;
        subject_id: number;
        mode: string;
        total_questions: number;
        duration: number;
        start_time: Date | null;
        submit_time: Date | null;
        score: number | null;
        correct_count: number | null;
        subject_name: string | undefined;
    };
}
export interface SessionAnswerRow {
    session_id: number;
    question_id: number;
    user_ans: string | null;
    is_correct: boolean | null;
}
//# sourceMappingURL=PracticeSession.d.ts.map