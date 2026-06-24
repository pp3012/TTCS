export interface CreateSubjectDTO {
    subject_name: string;
    total_chapter?: number;
    description?: string;
}
export declare function validateCreateSubject(data: Partial<CreateSubjectDTO>): string[];
//# sourceMappingURL=SubjectDTO.d.ts.map