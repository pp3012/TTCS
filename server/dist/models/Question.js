"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionModel = void 0;
class QuestionModel {
    constructor(row) {
        this.question_id = row.question_id;
        this.subject_id = row.subject_id;
        this.chapter_id = row.chapter_id;
        this.level_id = row.level_id;
        this.type_id = row.type_id;
        this.content = row.content;
        this.option_a = row.option_a;
        this.option_b = row.option_b;
        this.option_c = row.option_c;
        this.option_d = row.option_d;
        this.correct_option = row.correct_option;
        this.explanation = row.explanation;
        this.subject_name = row.subject_name;
        this.chapter_name = row.chapter_name;
        this.level_name = row.level_name;
        this.type_name = row.type_name;
    }
    static fromRow(row) {
        return new QuestionModel(row);
    }
    getQuestionId() { return this.question_id; }
    getCorrectOption() { return this.correct_option; }
    getChapterId() { return this.chapter_id; }
    getLevelId() { return this.level_id; }
    getTypeId() { return this.type_id; }
    // Trả về dữ liệu cho student - KHÔNG bao gồm correct_option và explanation
    toStudentJSON() {
        return {
            question_id: this.question_id,
            subject_id: this.subject_id,
            chapter_id: this.chapter_id,
            level_id: this.level_id,
            type_id: this.type_id,
            content: this.content,
            option_a: this.option_a,
            option_b: this.option_b,
            option_c: this.option_c,
            option_d: this.option_d,
            chapter_name: this.chapter_name,
            level_name: this.level_name,
            type_name: this.type_name,
        };
    }
    // Trả về đầy đủ cho admin hoặc sau khi nộp bài
    toFullJSON() {
        return {
            question_id: this.question_id,
            subject_id: this.subject_id,
            chapter_id: this.chapter_id,
            level_id: this.level_id,
            type_id: this.type_id,
            content: this.content,
            option_a: this.option_a,
            option_b: this.option_b,
            option_c: this.option_c,
            option_d: this.option_d,
            correct_option: this.correct_option,
            explanation: this.explanation,
            subject_name: this.subject_name,
            chapter_name: this.chapter_name,
            level_name: this.level_name,
            type_name: this.type_name,
        };
    }
}
exports.QuestionModel = QuestionModel;
//# sourceMappingURL=Question.js.map