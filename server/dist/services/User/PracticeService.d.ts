import { SubmitSessionDTO } from '../../dto/PracticeSessionDTO';
export declare class PracticeService {
    createFreeSession(user_id: number, subject_id: number, total_questions: number, duration: number, chapter_id?: number): Promise<{
        session_id: number;
        questions: object[];
    }>;
    getQuestionsBySession(session_id: number, user_id: number): Promise<object[]>;
    submitSession(session_id: number, user_id: number, dto: SubmitSessionDTO): Promise<object>;
    getSessionResult(session_id: number, user_id: number): Promise<object>;
    private updateUserStats;
    private parseJSON;
}
export declare const practiceService: PracticeService;
//# sourceMappingURL=PracticeService.d.ts.map