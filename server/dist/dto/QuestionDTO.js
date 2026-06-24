"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateQuestion = validateCreateQuestion;
function validateCreateQuestion(data) {
    const errors = [];
    if (!data.subject_id)
        errors.push('Môn học không được để trống');
    if (!data.content || data.content.trim().length === 0)
        errors.push('Nội dung câu hỏi không được để trống');
    if (!data.option_a)
        errors.push('Đáp án A không được để trống');
    if (!data.option_b)
        errors.push('Đáp án B không được để trống');
    if (!data.option_c)
        errors.push('Đáp án C không được để trống');
    if (!data.option_d)
        errors.push('Đáp án D không được để trống');
    if (!data.correct_option || !['A', 'B', 'C', 'D'].includes(data.correct_option))
        errors.push('Đáp án đúng phải là A, B, C hoặc D');
    return errors;
}
//# sourceMappingURL=QuestionDTO.js.map