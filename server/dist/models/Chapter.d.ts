export interface ChapterRow {
    chapter_id: number;
    subject_id: number;
    chapter_name: string;
    order_index: number | null;
}
export declare class ChapterModel {
    private chapter_id;
    private subject_id;
    private chapter_name;
    private order_index;
    private constructor();
    static fromRow(row: ChapterRow): ChapterModel;
    toJSON(): {
        chapter_id: number;
        subject_id: number;
        chapter_name: string;
        order_index: number | null;
    };
}
//# sourceMappingURL=Chapter.d.ts.map