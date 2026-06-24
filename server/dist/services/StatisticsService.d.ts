export declare class StatisticsService {
    getUserStats(user_id: number): Promise<object>;
    getUserStatsBySubject(user_id: number, subject_id: number): Promise<object>;
    getAdminSubjectStats(): Promise<object[]>;
    getLeaderboard(subject_id?: number, limit?: number): Promise<object[]>;
}
export declare const statisticsService: StatisticsService;
//# sourceMappingURL=StatisticsService.d.ts.map