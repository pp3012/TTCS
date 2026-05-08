export interface ChapterRow {
    chapter_id: number;
    subject_id: number;
    chapter_name: string;
    order_index: number | null;
}

export class ChapterModel {
    private chapter_id: number;
    private subject_id: number;
    private chapter_name: string;
    private order_index: number | null;

    private constructor(row: ChapterRow) {
        this.chapter_id = row.chapter_id;
        this.subject_id = row.subject_id;
        this.chapter_name = row.chapter_name;
        this.order_index = row.order_index;
    }

    static fromRow(row: ChapterRow): ChapterModel {
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