// Định nghĩa cấu trúc dữ liệu thô 1 row/record nhận về từ Database
export interface SubjectRow {
  subject_id: number;
  subject_name: string;
  total_chapter: number;
  description: string | null;
}
//Model
export class SubjectModel {
  private subject_id: number;
  private subject_name: string;
  private total_chapter: number;
  private description: string | null;

  //private Constructor
  private constructor(row: SubjectRow) {
    this.subject_id = row.subject_id;
    this.subject_name = row.subject_name;
    this.total_chapter = row.total_chapter;
    this.description = row.description;
  }

  static fromRow(row: SubjectRow): SubjectModel {
    return new SubjectModel(row);
  }

  getSubjectId(): number { return this.subject_id; }
  getSubjectName(): string { return this.subject_name; }
  getTotalChapter(): number { return this.total_chapter; }
  getDescription(): string | null { return this.description; }

  toJSON() {
    return {
      subject_id: this.subject_id,
      subject_name: this.subject_name,
      total_chapter: this.total_chapter,
      description: this.description,
    };
  }
}
