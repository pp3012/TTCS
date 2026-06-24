"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateSubject = validateCreateSubject;
function validateCreateSubject(data) {
    const errors = [];
    if (!data.subject_name || data.subject_name.trim().length === 0)
        errors.push('Tên môn học không được để trống');
    if (data.total_chapter !== undefined && Number(data.total_chapter) < 0)
        errors.push('Tổng số chương không được nhỏ hơn 0');
    return errors;
}
//# sourceMappingURL=SubjectDTO.js.map