import { Request, Response } from 'express';
type AuthRequest = Request & {
    user?: {
        user_id: number;
        role: string;
    };
};
export declare class QuestionController {
    getBySubject(req: Request, res: Response): Promise<void>;
    getById(req: AuthRequest, res: Response): Promise<void>;
    create(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    delete(req: AuthRequest, res: Response): Promise<void>;
    importFromExcel(req: AuthRequest, res: Response): Promise<void>;
    downloadTemplate(req: Request, res: Response): Promise<void>;
}
export declare const questionController: QuestionController;
export {};
//# sourceMappingURL=QuestionController.d.ts.map