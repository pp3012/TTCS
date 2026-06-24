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
    subject_name?: string;
    chapter_name?: string;
    level_name?: string;
    type_name?: string;
}
export declare class QuestionModel {
    private question_id;
    private subject_id;
    private chapter_id;
    private level_id;
    private type_id;
    private content;
    private option_a;
    private option_b;
    private option_c;
    private option_d;
    private correct_option;
    private explanation;
    private subject_name?;
    private chapter_name?;
    private level_name?;
    private type_name?;
    private constructor();
    static fromRow(row: QuestionRow): QuestionModel;
    getQuestionId(): number;
    getCorrectOption(): string | null;
    getChapterId(): number | null;
    getLevelId(): number | null;
    getTypeId(): number | null;
    toStudentJSON(): {
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
        chapter_name: string | undefined;
        level_name: string | undefined;
        type_name: string | undefined;
    };
    toFullJSON(): {
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
        subject_name: string | undefined;
        chapter_name: string | undefined;
        level_name: string | undefined;
        type_name: string | undefined;
    };
}
//# sourceMappingURL=Question.d.ts.map