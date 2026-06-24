"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatsModel = void 0;
class UserStatsModel {
    constructor(row) {
        this.user_id = row.user_id;
        this.subject_id = row.subject_id;
        this.total_sessions = row.total_sessions;
        this.overall_score = row.overall_score;
        this.chapter_accuracy = UserStatsModel.parseJSON(row.chapter_accuracy);
        this.difficulty_accuracy = UserStatsModel.parseJSON(row.difficulty_accuracy);
        this.type_accuracy = UserStatsModel.parseJSON(row.type_accuracy);
        this.last_updated = row.last_updated;
        this.subject_name = row.subject_name;
    }
    static parseJSON(val) {
        if (!val)
            return {};
        if (typeof val === 'object')
            return val;
        try {
            return JSON.parse(val);
        }
        catch {
            return {};
        }
    }
    static fromRow(row) {
        return new UserStatsModel(row);
    }
    getChapterAccuracy() { return this.chapter_accuracy; }
    getDifficultyAccuracy() { return this.difficulty_accuracy; }
    getTypeAccuracy() { return this.type_accuracy; }
    getTotalSessions() { return this.total_sessions; }
    getSubjectId() { return this.subject_id; }
    toJSON() {
        return {
            user_id: this.user_id,
            subject_id: this.subject_id,
            total_sessions: this.total_sessions,
            overall_score: this.overall_score,
            chapter_accuracy: this.chapter_accuracy,
            difficulty_accuracy: this.difficulty_accuracy,
            type_accuracy: this.type_accuracy,
            last_updated: this.last_updated,
            subject_name: this.subject_name,
        };
    }
}
exports.UserStatsModel = UserStatsModel;
//# sourceMappingURL=UserStats.js.map