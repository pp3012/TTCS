import { userStatsDAO } from '../dao/UserStatsDAO';
import { practiceSessionDAO } from '../dao/PracticeSessionDAO';
import { subjectDAO } from '../dao/SubjectDAO';
import { UserStatsModel } from '../models/UserStats';

export class StatisticsService {
  async getUserStats(user_id: number): Promise<object> {
    const allStats = await userStatsDAO.findAllByUser(user_id);
    return allStats.map(s => UserStatsModel.fromRow(s).toJSON());
  }

  async getUserStatsBySubject(user_id: number, subject_id: number): Promise<object> {
    const stats = await userStatsDAO.findByUserAndSubject(user_id, subject_id);
    if (!stats) return { user_id, subject_id, total_sessions: 0, overall_score: 0, chapter_accuracy: {}, difficulty_accuracy: {}, type_accuracy: {} };

    const scoreHistory = await practiceSessionDAO.getScoreHistory(user_id, subject_id);
    return { ...UserStatsModel.fromRow(stats).toJSON(), score_history: scoreHistory };
  }

  async getAdminSubjectStats(): Promise<object[]> {
    const subjects = await subjectDAO.findAll();
    const results = [];
    for (const subj of subjects) {
      const stats = await practiceSessionDAO.getStatsBySubject(subj.subject_id);
      results.push({ ...subj, ...stats });
    }
    return results;
  }
}

export const statisticsService = new StatisticsService();
