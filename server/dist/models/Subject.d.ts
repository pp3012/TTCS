export interface SubjectRow {
    subject_id: number;
    subject_name: string;
    total_chapter: number;
    description: string | null;
}
export declare class SubjectModel {
    private subject_id;
    private subject_name;
    private total_chapter;
    private description;
    private constructor();
    static fromRow(row: SubjectRow): SubjectModel;
    getSubjectId(): number;
    getSubjectName(): string;
    getTotalChapter(): number;
    getDescription(): string | null;
    toJSON(): {
        subject_id: number;
        subject_name: string;
        total_chapter: number;
        description: string | null;
    };
}
//# sourceMappingURL=Subject.d.ts.map