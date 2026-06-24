import { UserStatsRow } from '../models/UserStats';
export declare class UserStatsDAO {
    findByUserAndSubject(user_id: number, subject_id: number): Promise<UserStatsRow | null>;
    findAllByUser(user_id: number): Promise<UserStatsRow[]>;
    upsert(user_id: number, subject_id: number, data: {
        total_sessions?: number;
        overall_score?: number;
        chapter_accuracy?: Record<string, number>;
        difficulty_accuracy?: Record<string, number>;
        type_accuracy?: Record<string, number>;
    }): Promise<void>;
}
export declare const userStatsDAO: UserStatsDAO;
//# sourceMappingURL=UserStatsDAO.d.ts.map