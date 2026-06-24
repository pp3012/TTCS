import { Request, Response } from 'express';
type AuthRequest = Request & {
    user?: {
        user_id: number;
        role: string;
    };
};
export declare class PracticeController {
    createFreeSession(req: AuthRequest, res: Response): Promise<void>;
    createPersonalizedSession(req: AuthRequest, res: Response): Promise<void>;
    getQuestions(req: AuthRequest, res: Response): Promise<void>;
    submitSession(req: AuthRequest, res: Response): Promise<void>;
    getResult(req: AuthRequest, res: Response): Promise<void>;
    getHistory(req: AuthRequest, res: Response): Promise<void>;
}
export declare const practiceController: PracticeController;
export {};
//# sourceMappingURL=PracticeController.d.ts.map