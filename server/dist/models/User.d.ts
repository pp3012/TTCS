export interface UserRow {
    user_id: number;
    user_name: string;
    email: string;
    password_hash: string;
    full_name: string | null;
    role: string;
    created_at: Date;
}
export declare class UserModel {
    private user_id;
    private user_name;
    private email;
    private full_name;
    private role;
    private created_at;
    private constructor();
    static fromRow(row: UserRow): UserModel;
    getUserId(): number;
    getUserName(): string;
    getEmail(): string;
    getFullName(): string | null;
    getRole(): string;
    getCreatedAt(): Date;
    toPublicJSON(): {
        user_id: number;
        user_name: string;
        email: string;
        full_name: string | null;
        role: string;
        created_at: Date;
    };
}
//# sourceMappingURL=User.d.ts.map