export declare class PersonalizedService {
    createPersonalizedSession(user_id: number, subject_id: number): Promise<{
        session_id: number;
        questions: object[];
    }>;
    private computeDifficultyDistribution;
    private computeChapterWeights;
    private computeQuestionWeights;
    private weightedSample;
    private shuffle;
    private parseJSON;
}
export declare const personalizedService: PersonalizedService;
//# sourceMappingURL=PersonalizedService.d.ts.map