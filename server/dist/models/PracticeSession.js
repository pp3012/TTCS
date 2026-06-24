"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PracticeSessionModel = void 0;
class PracticeSessionModel {
    constructor(row) {
        this.session_id = row.session_id;
        this.user_id = row.user_id;
        this.subject_id = row.subject_id;
        this.mode = row.mode;
        this.total_questions = row.total_questions;
        this.duration = row.duration;
        this.start_time = row.start_time;
        this.submit_time = row.submit_time;
        this.score = row.score;
        this.correct_count = row.correct_count;
        this.subject_name = row.subject_name;
    }
    static fromRow(row) {
        return new PracticeSessionModel(row);
    }
    getSessionId() { return this.session_id; }
    getUserId() { return this.user_id; }
    getSubjectId() { return this.subject_id; }
    toJSON() {
        return {
            session_id: this.session_id,
            user_id: this.user_id,
            subject_id: this.subject_id,
            mode: this.mode,
            total_questions: this.total_questions,
            duration: this.duration,
            start_time: this.start_time,
            submit_time: this.submit_time,
            score: this.score,
            correct_count: this.correct_count,
            subject_name: this.subject_name,
        };
    }
}
exports.PracticeSessionModel = PracticeSessionModel;
//# sourceMappingURL=PracticeSession.js.map