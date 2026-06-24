"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateUser = validateCreateUser;
// Kiểm tra dữ liệu từ User trước khi thực hiện tác vụ
function validateCreateUser(data) {
    const errors = [];
    if (!data.user_name || data.user_name.trim().length < 3)
        errors.push('Tên đăng nhập phải có ít nhất 3 ký tự');
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        errors.push('Email không hợp lệ');
    if (!data.password || data.password.length < 6)
        errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    return errors;
}
//# sourceMappingURL=UserDTO.js.map