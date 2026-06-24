export interface CreateSessionDTO {
    user_id: number;
    subject_id: number;
    mode: 'free' | 'personalized';
    total_questions: number;
    duration: number;
}
export interface SubmitAnswerDTO {
    question_id: number;
    user_ans: string | null;
}
export interface SubmitSessionDTO {
    answers: SubmitAnswerDTO[];
}
//# sourceMappingURL=PracticeSessionDTO.d.ts.map