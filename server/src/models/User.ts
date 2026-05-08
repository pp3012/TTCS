
export interface UserRow {
  user_id: number;
  user_name: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  role: string;
  created_at: Date;
}
//Model
export class UserModel {
  private user_id: number;
  private user_name: string;
  private email: string;
  private full_name: string | null;
  private role: string;
  private created_at: Date;

  private constructor(row: UserRow) {
    this.user_id = row.user_id;
    this.user_name = row.user_name;
    this.email = row.email;
    this.full_name = row.full_name;
    this.role = row.role;
    this.created_at = row.created_at;
  }

  static fromRow(row: UserRow): UserModel {
    return new UserModel(row);
  }

  getUserId(): number { return this.user_id; }
  getUserName(): string { return this.user_name; }
  getEmail(): string { return this.email; }
  getFullName(): string | null { return this.full_name; }
  getRole(): string { return this.role; }
  getCreatedAt(): Date { return this.created_at; }

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
