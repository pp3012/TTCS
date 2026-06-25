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

export class UserStatsModel {
  private user_id: number;
  private subject_id: number;
  private total_sessions: number;
  private overall_score: number;
  private chapter_accuracy: Record<string, number>;
  private difficulty_accuracy: Record<string, number>;
  private type_accuracy: Record<string, number>;
  private last_updated: Date;
  private subject_name?: string;

  private constructor(row: UserStatsRow) {
    this.user_id = row.user_id;
    this.subject_id = row.subject_id;
    this.total_sessions = row.total_sessions;
    this.overall_score = row.overall_score;
    this.chapter_accuracy = UserStatsModel.parseJSON(row.chapter_accuracy);
    this.difficulty_accuracy = UserStatsModel.parseJSON(row.difficulty_accuracy);
    this.type_accuracy = UserStatsModel.parseJSON(row.type_accuracy);
    this.last_updated = row.last_updated;
    this.subject_name = row.subject_name;
  }

  // Hàm nội bộ để phân tích cú pháp chuỗi JSON một cách an toàn
  private static parseJSON(val: string | Record<string, number> | null): Record<string, number> {
    if (!val) return {};
    if (typeof val === 'object') return val;
    try { return JSON.parse(val); } catch { return {}; }
  }

  static fromRow(row: UserStatsRow): UserStatsModel {
    return new UserStatsModel(row);
  }

  getChapterAccuracy(): Record<string, number> { return this.chapter_accuracy; }
  getDifficultyAccuracy(): Record<string, number> { return this.difficulty_accuracy; }
  getTypeAccuracy(): Record<string, number> { return this.type_accuracy; }
  getTotalSessions(): number { return this.total_sessions; }
  getSubjectId(): number { return this.subject_id; }

  toJSON() {
    return {
      user_id: this.user_id,
      subject_id: this.subject_id,
      total_sessions: this.total_sessions,
      overall_score: this.overall_score,
      chapter_accuracy: this.chapter_accuracy,
      difficulty_accuracy: this.difficulty_accuracy,
      type_accuracy: this.type_accuracy,
      last_updated: this.last_updated,
      subject_name: this.subject_name,
    };
  }
}
export interface UserQuestionStatusRow {
  user_id: number;
  question_id: number;
  is_latest_correct: boolean | null;
  last_practiced: Date | null;
  correct_count: number;
  wrong_count: number;
}

