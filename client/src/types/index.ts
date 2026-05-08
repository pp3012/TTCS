// TypeScript interfaces matching the backend models

export interface User {
  user_id: number;
  user_name: string;
  email: string;
  full_name: string | null;
  role: 'student' | 'admin';
  created_at: string;
}

export interface Subject {
  subject_id: number;
  subject_name: string;
  total_chapter: number;
  description: string | null;
  question_count?: number;
  chapters?: Chapter[];
}

export interface Chapter {
  chapter_id: number;
  subject_id: number;
  chapter_name: string;
  order_index: number | null;
}

export interface DifficultyLevel {
  level_id: number;
  level_name: string;
}

export interface QuestionType {
  type_id: number;
  type_name: string;
}

export interface Question {
  question_id: number;
  subject_id: number;
  chapter_id: number | null;
  level_id: number | null;
  type_id: number | null;
  content: string;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  correct_option?: string | null;
  explanation?: string | null;
  chapter_name?: string;
  level_name?: string;
  type_name?: string;
}

export interface PracticeSession {
  session_id: number;
  user_id: number;
  subject_id: number;
  mode: 'free' | 'personalized';
  total_questions: number;
  duration: number;
  start_time: string | null;
  submit_time: string | null;
  score: number | null;
  correct_count: number | null;
  subject_name?: string;
}

export interface SessionAnswer {
  session_id: number;
  question_id: number;
  user_ans: string | null;
  is_correct: boolean | null;
}

export interface SessionResult {
  session_id: number;
  score: number;
  correct_count: number;
  total_questions: number;
  submit_time: string;
  start_time: string;
  duration_actual: number;
  mode: string;
  subject_id: number;
  subject_name?: string;
  details: (Question & { user_ans: string | null; is_correct: boolean })[];
}

export interface UserStats {
  user_id: number;
  subject_id: number;
  total_sessions: number;
  overall_score: number;
  chapter_accuracy: Record<string, number>;
  difficulty_accuracy: Record<string, number>;
  type_accuracy: Record<string, number>;
  last_updated: string;
  subject_name?: string;
  score_history?: { submit_time: string; score: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}
