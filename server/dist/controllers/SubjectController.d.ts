import { Request, Response } from 'express';
type AuthRequest = Request & {
    user?: {
        user_id: number;
        role: string;
    };
};
export declare class SubjectController {
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    getDifficultyLevels(req: Request, res: Response): Promise<void>;
    getQuestionTypes(req: Request, res: Response): Promise<void>;
    create(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    addChapter(req: AuthRequest, res: Response): Promise<void>;
    updateChapter(req: AuthRequest, res: Response): Promise<void>;
    delete(req: AuthRequest, res: Response): Promise<void>;
}
export declare const subjectController: SubjectController;
export {};
//# sourceMappingURL=SubjectController.d.ts.map