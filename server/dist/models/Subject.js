"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectModel = void 0;
//Model
class SubjectModel {
    constructor(row) {
        this.subject_id = row.subject_id;
        this.subject_name = row.subject_name;
        this.total_chapter = row.total_chapter;
        this.description = row.description;
    }
    static fromRow(row) {
        return new SubjectModel(row);
    }
    getSubjectId() { return this.subject_id; }
    getSubjectName() { return this.subject_name; }
    getTotalChapter() { return this.total_chapter; }
    getDescription() { return this.description; }
    toJSON() {
        return {
            subject_id: this.subject_id,
            subject_name: this.subject_name,
            total_chapter: this.total_chapter,
            description: this.description,
        };
    }
}
exports.SubjectModel = SubjectModel;
//# sourceMappingURL=Subject.js.map