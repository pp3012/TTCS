"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChapterModel = void 0;
class ChapterModel {
    constructor(row) {
        this.chapter_id = row.chapter_id;
        this.subject_id = row.subject_id;
        this.chapter_name = row.chapter_name;
        this.order_index = row.order_index;
    }
    static fromRow(row) {
        return new ChapterModel(row);
    }
    toJSON() {
        return {
            chapter_id: this.chapter_id,
            subject_id: this.subject_id,
            chapter_name: this.chapter_name,
            order_index: this.order_index,
        };
    }
}
exports.ChapterModel = ChapterModel;
//# sourceMappingURL=Chapter.js.map