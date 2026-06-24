export interface UserStatsRow {
    user_id: number;
    subject_id: number;
    total_sessions: number;
    overall_score: number;
    chapter_accuracy: string | Record<string, number> | null;
    difficulty_accuracy: string | Record<string, number> | null;
    type_accuracy: string | Record<string, number> | null;
    last_updated: Date;
    subject_name?: string;
}
export declare class UserStatsModel {
    private user_id;
    private subject_id;
    private total_sessions;
    private overall_score;
    private chapter_accuracy;
    private difficulty_accuracy;
    private type_accuracy;
    private last_updated;
    private subject_name?;
    private constructor();
    private static parseJSON;
    static fromRow(row: UserStatsRow): UserStatsModel;
    getChapterAccuracy(): Record<string, number>;
    getDifficultyAccuracy(): Record<string, number>;
    getTypeAccuracy(): Record<string, number>;
    getTotalSessions(): number;
    getSubjectId(): number;
    toJSON(): {
        user_id: number;
        subject_id: number;
        total_sessions: number;
        overall_score: number;
        chapter_accuracy: Record<string, number>;
        difficulty_accuracy: Record<string, number>;
        type_accuracy: Record<string, number>;
        last_updated: Date;
        subject_name: string | undefined;
    };
}
export interface UserQuestionStatusRow {
    user_id: number;
    question_id: number;
    is_latest_correct: boolean | null;
    last_practiced: Date | null;
    correct_count: number;
    wrong_count: number;
}
//# sourceMappingURL=UserStats.d.ts.map