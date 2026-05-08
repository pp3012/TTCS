//DTO
export interface CreateUserDTO {
    user_name: string;
    email: string;
    password: string;
    full_name?: string;
}
//?: các trường có thể có hc ko, vd update mỗi email hc name
export interface UpdateUserDTO {
    email?: string;
    full_name?: string;
    password?: string;
}
// Kiểm tra dữ liệu từ User trước khi thực hiện tác vụ
export function validateCreateUser(data: Partial<CreateUserDTO>): string[] {
    const errors: string[] = [];
    if (!data.user_name || data.user_name.trim().length < 3)
        errors.push('Tên đăng nhập phải có ít nhất 3 ký tự');
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        errors.push('Email không hợp lệ');
    if (!data.password || data.password.length < 6)
        errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    return errors;
}
