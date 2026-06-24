import { Request, Response, NextFunction } from 'express';
type AuthRequest = Request & {
    user?: {
        user_id: number;
        role: string;
    };
};
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=authMiddleware.d.ts.map