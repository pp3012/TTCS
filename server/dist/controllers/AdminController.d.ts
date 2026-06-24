import { Request, Response } from 'express';
type AuthRequest = Request & {
    user?: {
        user_id: number;
        role: string;
    };
};
export declare class AdminController {
    getUsers(req: AuthRequest, res: Response): Promise<void>;
    getUserById(req: AuthRequest, res: Response): Promise<void>;
    updateUser(req: AuthRequest, res: Response): Promise<void>;
    deleteUser(req: AuthRequest, res: Response): Promise<void>;
    getSubjectStats(req: AuthRequest, res: Response): Promise<void>;
    getUserStats(req: AuthRequest, res: Response): Promise<void>;
}
export declare const adminController: AdminController;
export {};
//# sourceMappingURL=AdminController.d.ts.map