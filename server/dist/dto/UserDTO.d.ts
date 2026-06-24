export interface CreateUserDTO {
    user_name: string;
    email: string;
    password: string;
    full_name?: string;
}
export interface UpdateUserDTO {
    email?: string;
    full_name?: string;
    password?: string;
}
export declare function validateCreateUser(data: Partial<CreateUserDTO>): string[];
//# sourceMappingURL=UserDTO.d.ts.map