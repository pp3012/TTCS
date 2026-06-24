import { UserRow } from '../models/User';
export declare class UserDAO {
    findByUsername(user_name: string): Promise<UserRow | null>;
    findByEmail(email: string): Promise<UserRow | null>;
    findById(user_id: number): Promise<UserRow | null>;
    findByUsernameOrEmail(identifier: string): Promise<UserRow | null>;
    create(data: {
        user_name: string;
        email: string;
        password_hash: string;
        full_name?: string;
        role?: string;
    }): Promise<number>;
    update(user_id: number, data: {
        email?: string;
        full_name?: string;
        password_hash?: string;
    }): Promise<void>;
    hasPracticeHistory(user_id: number): Promise<boolean>;
    delete(user_id: number): Promise<void>;
    findAll(page?: number, limit?: number, search?: string): Promise<{
        users: UserRow[];
        total: number;
    }>;
}
export declare const userDAO: UserDAO;
//# sourceMappingURL=UserDAO.d.ts.map