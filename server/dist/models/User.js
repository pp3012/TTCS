"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
//Model
class UserModel {
    constructor(row) {
        this.user_id = row.user_id;
        this.user_name = row.user_name;
        this.email = row.email;
        this.full_name = row.full_name;
        this.role = row.role;
        this.created_at = row.created_at;
    }
    static fromRow(row) {
        return new UserModel(row);
    }
    getUserId() { return this.user_id; }
    getUserName() { return this.user_name; }
    getEmail() { return this.email; }
    getFullName() { return this.full_name; }
    getRole() { return this.role; }
    getCreatedAt() { return this.created_at; }
    toPublicJSON() {
        return {
            user_id: this.user_id,
            user_name: this.user_name,
            email: this.email,
            full_name: this.full_name,
            role: this.role,
            created_at: this.created_at,
        };
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=User.js.map