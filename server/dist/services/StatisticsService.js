"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statisticsService = exports.StatisticsService = void 0;
const UserStatsDAO_1 = require("../dao/UserStatsDAO");
const PracticeSessionDAO_1 = require("../dao/PracticeSessionDAO");
const SubjectDAO_1 = require("../dao/SubjectDAO");
const UserStats_1 = require("../models/UserStats");
class StatisticsService {
    async getUserStats(user_id) {
        const allStats = await UserStatsDAO_1.userStatsDAO.findAllByUser(user_id);
        return allStats.map(s => UserStats_1.UserStatsModel.fromRow(s).toJSON());
    }
    async getUserStatsBySubject(user_id, subject_id) {
        const stats = await UserStatsDAO_1.userStatsDAO.findByUserAndSubject(user_id, subject_id);
        if (!stats)
            return { user_id, subject_id, total_sessions: 0, overall_score: 0, chapter_accuracy: {}, difficulty_accuracy: {}, type_accuracy: {} };
        const scoreHistory = await PracticeSessionDAO_1.practiceSessionDAO.getScoreHistory(user_id, subject_id);
        return { ...UserStats_1.UserStatsModel.fromRow(stats).toJSON(), score_history: scoreHistory };
    }
    async getAdminSubjectStats() {
        const subjects = await SubjectDAO_1.subjectDAO.findAll();
        const results = [];
        for (const subj of subjects) {
            const stats = await PracticeSessionDAO_1.practiceSessionDAO.getStatsBySubject(subj.subject_id);
            results.push({ ...subj, ...stats });
        }
        return results;
    }
    async getLeaderboard(subject_id, limit = 20) {
        return PracticeSessionDAO_1.practiceSessionDAO.getLeaderboard(subject_id, limit);
    }
}
exports.StatisticsService = StatisticsService;
exports.statisticsService = new StatisticsService();
//# sourceMappingURL=StatisticsService.js.map