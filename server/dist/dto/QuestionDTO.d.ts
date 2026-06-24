export interface CreateQuestionDTO {
    subject_id: number;
    chapter_id?: number;
    level_id?: number;
    type_id?: number;
    content: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: string;
    explanation?: string;
}
export declare function validateCreateQuestion(data: Partial<CreateQuestionDTO>): string[];
//# sourceMappingURL=QuestionDTO.d.ts.map