"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
async function generateHashes() {
    // Sinh hash cho mật khẩu 123456 bằng đúng cấu hình của bạn (10 rounds)
    const hash1 = await bcrypt_1.default.hash('123456', 10);
    const hash2 = await bcrypt_1.default.hash('123456', 10);
    console.log("Chuỗi hash cho tài khoản admin:", hash1);
    console.log("Chuỗi hash cho tài khoản st01 :", hash2);
}
generateHashes();
//# sourceMappingURL=Test.js.js.map