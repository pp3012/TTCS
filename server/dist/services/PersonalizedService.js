"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.personalizedService = exports.PersonalizedService = void 0;
/**
 * PersonalizedService: Thuật toán luyện tập cá nhân hóa
 * Bước 1: Phân bố độ khó | Bước 2: Trọng số chương | Bước 3: Trọng số câu hỏi
 */
const QuestionDAO_1 = require("../dao/QuestionDAO");
const PracticeSessionDAO_1 = require("../dao/PracticeSessionDAO");
const UserStatsDAO_1 = require("../dao/UserStatsDAO");
const Question_1 = require("../models/Question");
const DEFAULT_QUESTIONS = 50;
const DEFAULT_DURATION = 3600;
class PersonalizedService {
    async createPersonalizedSession(user_id, subject_id) {
        const stats = await UserStatsDAO_1.userStatsDAO.findByUserAndSubject(user_id, subject_id);
        if (!stats || (stats.total_sessions || 0) < 3) {
            throw new Error('Bạn cần hoàn thành ít nhất 3 lượt luyện tập để hệ thống có thể phân tích và tạo đề cá nhân hóa. Vui lòng trải nghiệm chế độ luyện tập tự do trước.');
        }
        const diffAcc = this.parseJSON(stats?.difficulty_accuracy);
        const chapterAcc = this.parseJSON(stats?.chapter_accuracy);
        const diffDist = this.computeDifficultyDistribution(diffAcc);
        const allQuestions = await QuestionDAO_1.questionDAO.findBySubjectGrouped(subject_id);
        if (allQuestions.length < DEFAULT_QUESTIONS) {
            throw new Error(`Môn học không đủ câu hỏi trong ngân hàng (yêu cầu tối thiểu ${DEFAULT_QUESTIONS} câu, hiện tại chỉ có ${allQuestions.length} câu)`);
        }
        const qIds = allQuestions.map(q => q.question_id);
        const statusList = await QuestionDAO_1.questionDAO.getUserQuestionStatus(user_id, qIds);
        const statusMap = new Map(statusList.map(s => [s.question_id, s]));
        const chapterIds = [...new Set(allQuestions.map(q => q.chapter_id).filter(Boolean))];
        const chapterWeights = this.computeChapterWeights(chapterIds, chapterAcc);
        const totalCW = Object.values(chapterWeights).reduce((a, b) => a + b, 0);
        const selectedIds = new Set();
        const selectedQuestions = [];
        for (const chapterId of chapterIds) {
            const chW = chapterWeights[String(chapterId)] || 0.8;
            const chRatio = totalCW > 0 ? chW / totalCW : 1 / chapterIds.length;
            const chCount = Math.max(1, Math.round(chRatio * DEFAULT_QUESTIONS));
            const chapterQs = allQuestions.filter(q => q.chapter_id === chapterId);
            for (const [levelId, ratio] of Object.entries(diffDist)) {
                const levelCount = Math.max(0, Math.round(chCount * ratio));
                if (levelCount === 0)
                    continue;
                const levelQs = chapterQs.filter(q => q.level_id === Number(levelId) && !selectedIds.has(q.question_id));
                if (levelQs.length === 0)
                    continue;
                const weighted = this.computeQuestionWeights(levelQs, statusMap);
                const chosen = this.weightedSample(weighted, Math.min(levelCount, weighted.length));
                for (const q of chosen) {
                    if (!selectedIds.has(q.question_id)) {
                        selectedIds.add(q.question_id);
                        selectedQuestions.push(q);
                    }
                }
            }
        }
        if (selectedQuestions.length < DEFAULT_QUESTIONS) {
            const remaining = allQuestions.filter(q => !selectedIds.has(q.question_id));
            const weighted = this.computeQuestionWeights(remaining, statusMap);
            const extra = this.weightedSample(weighted, Math.min(DEFAULT_QUESTIONS - selectedQuestions.length, weighted.length));
            for (const q of extra) {
                if (!selectedIds.has(q.question_id)) {
                    selectedIds.add(q.question_id);
                    selectedQuestions.push(q);
                }
            }
        }
        const finalQuestions = this.shuffle(selectedQuestions).slice(0, DEFAULT_QUESTIONS);
        const session_id = await PracticeSessionDAO_1.practiceSessionDAO.create({ user_id, subject_id, mode: 'personalized', total_questions: finalQuestions.length, duration: DEFAULT_DURATION });
        const answers = finalQuestions.map(q => ({ question_id: q.question_id, user_ans: null, is_correct: false }));
        await PracticeSessionDAO_1.practiceSessionDAO.saveAnswers(session_id, answers);
        return { session_id, questions: finalQuestions.map(q => Question_1.QuestionModel.fromRow(q).toStudentJSON()) };
    }
    computeDifficultyDistribution(diffAcc) {
        const easyAcc = diffAcc['1'], medAcc = diffAcc['2'];
        if (easyAcc === undefined && medAcc === undefined)
            return { '1': 0.40, '2': 0.40, '3': 0.20 };
        if (easyAcc !== undefined && easyAcc >= 0.80) {
            if (medAcc !== undefined && medAcc >= 0.80)
                return { '1': 0.20, '2': 0.20, '3': 0.60 };
            return { '1': 0.20, '2': 0.40, '3': 0.40 };
        }
        if (easyAcc !== undefined && easyAcc < 0.50)
            return { '1': 0.60, '2': 0.30, '3': 0.10 };
        return { '1': 0.30, '2': 0.40, '3': 0.30 };
    }
    computeChapterWeights(chapterIds, chapterAcc) {
        const weights = {};
        for (const id of chapterIds) {
            const acc = chapterAcc[String(id)];
            weights[String(id)] = acc !== undefined ? Math.max(0.01, 1 - acc) : 0.8;
        }
        return weights;
    }
    computeQuestionWeights(questions, statusMap) {
        return questions.map(q => {
            const status = statusMap.get(q.question_id);
            if (!status)
                return { question: q, weight: 1.0 };
            const total = status.correct_count + status.wrong_count;
            const baseWeight = total === 0 ? 1.0 : 1 - (status.correct_count / total);
            const repeatFactor = status.is_latest_correct === false ? 1.5 : 1.0;
            return { question: q, weight: Math.max(0.01, baseWeight * repeatFactor) };
        });
    }
    weightedSample(items, count) {
        const result = [];
        const pool = [...items];
        for (let i = 0; i < count && pool.length > 0; i++) {
            const totalW = pool.reduce((s, item) => s + item.weight, 0);
            let rand = Math.random() * totalW;
            let idx = 0;
            for (let j = 0; j < pool.length; j++) {
                rand -= pool[j].weight;
                if (rand <= 0) {
                    idx = j;
                    break;
                }
            }
            result.push(pool[idx].question);
            pool.splice(idx, 1);
        }
        return result;
    }
    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    parseJSON(val) {
        if (!val)
            return {};
        if (typeof val === 'object')
            return val;
        try {
            return JSON.parse(val);
        }
        catch {
            return {};
        }
    }
}
exports.PersonalizedService = PersonalizedService;
exports.personalizedService = new PersonalizedService();
//# sourceMappingURL=PersonalizedService.js.map