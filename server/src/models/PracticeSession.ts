export interface PracticeSessionRow {
   session_id: number;
   user_id: number;
   subject_id: number;
   mode: 'free' | 'personalized';
   total_questions: number;
   duration: number; // seconds
   start_time: Date | null;
   submit_time: Date | null;
   score: number | null;
   correct_count: number | null;
   subject_name?: string;
}

export class PracticeSessionModel {
  private session_id: number;
  private user_id: number;
  private subject_id: number;
  private mode: string;
  private total_questions: number;
  private duration: number;
  private start_time: Date | null;
  private submit_time: Date | null;
  private score: number | null;
  private correct_count: number | null;
  private subject_name?: string;

  private constructor(row: PracticeSessionRow) {
    this.session_id = row.session_id;
    this.user_id = row.user_id;
    this.subject_id = row.subject_id;
    this.mode = row.mode;
    this.total_questions = row.total_questions;
    this.duration = row.duration;
    this.start_time = row.start_time;
    this.submit_time = row.submit_time;
    this.score = row.score;
    this.correct_count = row.correct_count;
    this.subject_name = row.subject_name;
  }

  static fromRow(row: PracticeSessionRow): PracticeSessionModel {
    return new PracticeSessionModel(row);
  }

  getSessionId(): number { return this.session_id; }
  getUserId(): number { return this.user_id; }
  getSubjectId(): number { return this.subject_id; }

  toJSON() {
    return {
      session_id: this.session_id,
      user_id: this.user_id,
      subject_id: this.subject_id,
      mode: this.mode,
      total_questions: this.total_questions,
      duration: this.duration,
      start_time: this.start_time,
      submit_time: this.submit_time,
      score: this.score,
      correct_count: this.correct_count,
      subject_name: this.subject_name,
    };
  }
}
export interface SessionAnswerRow {
  session_id: number;
  question_id: number;
  user_ans: string | null;
  is_correct: boolean | null;
}

