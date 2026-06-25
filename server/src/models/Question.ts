// Định nghĩa cấu trúc dữ liệu thô 1 row/record nhận về từ Database
export interface QuestionRow {
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
  correct_option: string | null;
  explanation: string | null;
  // joined fields
  subject_name?: string;
  chapter_name?: string;
  level_name?: string;
  type_name?: string;
}

export class QuestionModel {
  private question_id: number;
  private subject_id: number;
  private chapter_id: number | null;
  private level_id: number | null;
  private type_id: number | null;
  private content: string;
  private option_a: string | null;
  private option_b: string | null;
  private option_c: string | null;
  private option_d: string | null;
  private correct_option: string | null;
  private explanation: string | null;
  private subject_name?: string;
  private chapter_name?: string;
  private level_name?: string;
  private type_name?: string;

  private constructor(row: QuestionRow) {
    this.question_id = row.question_id;
    this.subject_id = row.subject_id;
    this.chapter_id = row.chapter_id;
    this.level_id = row.level_id;
    this.type_id = row.type_id;
    this.content = row.content;
    this.option_a = row.option_a;
    this.option_b = row.option_b;
    this.option_c = row.option_c;
    this.option_d = row.option_d;
    this.correct_option = row.correct_option;
    this.explanation = row.explanation;
    this.subject_name = row.subject_name;
    this.chapter_name = row.chapter_name;
    this.level_name = row.level_name;
    this.type_name = row.type_name;
  }

  static fromRow(row: QuestionRow): QuestionModel {
    return new QuestionModel(row);
  }

  getQuestionId(): number { return this.question_id; }
  getCorrectOption(): string | null { return this.correct_option; }
  getChapterId(): number | null { return this.chapter_id; }
  getLevelId(): number | null { return this.level_id; }
  getTypeId(): number | null { return this.type_id; }

  // Trả về dữ liệu cho student - KHÔNG bao gồm correct_option và explanation
  toStudentJSON() {
    return {
      question_id: this.question_id,
      subject_id: this.subject_id,
      chapter_id: this.chapter_id,
      level_id: this.level_id,
      type_id: this.type_id,
      content: this.content,
      option_a: this.option_a,
      option_b: this.option_b,
      option_c: this.option_c,
      option_d: this.option_d,
      chapter_name: this.chapter_name,
      level_name: this.level_name,
      type_name: this.type_name,
    };
  }

  // Trả về đầy đủ cho admin hoặc sau khi nộp bài
  toFullJSON() {
    return {
      question_id: this.question_id,
      subject_id: this.subject_id,
      chapter_id: this.chapter_id,
      level_id: this.level_id,
      type_id: this.type_id,
      content: this.content,
      option_a: this.option_a,
      option_b: this.option_b,
      option_c: this.option_c,
      option_d: this.option_d,
      correct_option: this.correct_option,
      explanation: this.explanation,
      subject_name: this.subject_name,
      chapter_name: this.chapter_name,
      level_name: this.level_name,
      type_name: this.type_name,
    };
  }
}
