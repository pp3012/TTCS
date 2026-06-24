import { CreateUserDTO } from '../dto/UserDTO';
export declare class AuthService {
    register(data: CreateUserDTO): Promise<{
        user: object;
        token: string;
    }>;
    login(identifier: string, password: string): Promise<{
        user: object;
        token: string;
    }>;
    getProfile(user_id: number): Promise<object>;
    changePassword(user_id: number, old_password: string, new_password: string): Promise<void>;
    private generateToken;
    verifyToken(token: string): {
        user_id: number;
        role: string;
    };
}
export declare const authService: AuthService;
//# sourceMappingURL=AuthService.d.ts.map