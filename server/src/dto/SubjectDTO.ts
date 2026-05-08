export interface CreateSubjectDTO {
    subject_name: string;
    description?: string;
}

export function validateCreateSubject(data: Partial<CreateSubjectDTO>): string[] {
    const errors: string[] = [];
    if (!data.subject_name || data.subject_name.trim().length === 0)
        errors.push('Tên môn học không được để trống');
    return errors;
}
