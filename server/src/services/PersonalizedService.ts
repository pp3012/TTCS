/**
 * PersonalizedService: Thuật toán luyện tập cá nhân hóa
 * Bước 1: Phân bố độ khó | Bước 2: Trọng số chương | Bước 3: Trọng số câu hỏi
 */
import { questionDAO } from '../dao/QuestionDAO';
import { practiceSessionDAO } from '../dao/PracticeSessionDAO';
import { userStatsDAO } from '../dao/UserStatsDAO';
import { QuestionModel, QuestionRow } from '../models/Question';
import { UserQuestionStatusRow } from '../models/UserStats';

const DEFAULT_QUESTIONS = 50;
const DEFAULT_DURATION = 3600;

interface WeightedQuestion { question: QuestionRow; weight: number; }

export class PersonalizedService {
  async createPersonalizedSession(user_id: number, subject_id: number): Promise<{ session_id: number; questions: object[] }> {
    const stats = await userStatsDAO.findByUserAndSubject(user_id, subject_id);
    if (!stats || (stats.total_sessions || 0) < 3) {
      throw new Error('Bạn cần hoàn thành ít nhất 3 lượt luyện tập để hệ thống có thể phân tích và tạo đề cá nhân hóa. Vui lòng trải nghiệm chế độ luyện tập tự do trước.');
    }
    const diffAcc = this.parseJSON(stats?.difficulty_accuracy);
    const chapterAcc = this.parseJSON(stats?.chapter_accuracy);

    // Bước 1 — Xác định phân bố độ khó
    const diffDist = this.computeDifficultyDistribution(diffAcc);

    const allQuestions = await questionDAO.findBySubjectGrouped(subject_id);
    if (allQuestions.length < DEFAULT_QUESTIONS) {
      throw new Error(`Môn học không đủ câu hỏi trong ngân hàng (yêu cầu tối thiểu ${DEFAULT_QUESTIONS} câu, hiện tại chỉ có ${allQuestions.length} câu)`);
    }

    const qIds = allQuestions.map(q => q.question_id);
    const statusList = await questionDAO.getUserQuestionStatus(user_id, qIds);
    const statusMap = new Map(statusList.map(s => [s.question_id, s]));

    const chapterIds = [...new Set(allQuestions.map(q => q.chapter_id).filter(Boolean))] as number[];

    // Bước 2 — Xác định tỉ trọng theo chương
    const chapterWeights = this.computeChapterWeights(chapterIds, chapterAcc);
    const totalCW = Object.values(chapterWeights).reduce((a, b) => a + b, 0);

    const selectedIds = new Set<number>();
    const selectedQuestions: QuestionRow[] = [];

    // Phân bổ câu hỏi theo Ma trận (Chương x Độ khó)
    for (const chapterId of chapterIds) {
      const chW = chapterWeights[String(chapterId)] || 0.8;
      const chRatio = totalCW > 0 ? chW / totalCW : 1 / chapterIds.length;
      const chapterQs = allQuestions.filter(q => q.chapter_id === chapterId);

      for (const [levelId, ratio] of Object.entries(diffDist)) {
        // Tối ưu hóa: Tính toán trực tiếp số câu từ cấu trúc tổng 50 để tránh sai số làm tròn kép
        const targetCount = Math.round(DEFAULT_QUESTIONS * chRatio * ratio);
        if (targetCount === 0) continue;

        const levelQs = chapterQs.filter(q => q.level_id === Number(levelId) && !selectedIds.has(q.question_id));
        if (levelQs.length === 0) continue;

        // Bước 3 — Tính trọng số cho từng câu hỏi và bốc ngẫu nhiên có trọng số
        const weighted = this.computeQuestionWeights(levelQs, statusMap);
        const chosen = this.weightedSample(weighted, Math.min(targetCount, weighted.length));

        for (const q of chosen) {
          if (!selectedIds.has(q.question_id)) {
            selectedIds.add(q.question_id);
            selectedQuestions.push(q);
          }
        }
      }
    }

    // Cơ chế bù đắp khẩn cấp (Fallback): Nếu ma trận làm tròn bị thiếu hụt câu hỏi
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

    // Tráo đổi ngẫu nhiên vị trí và cắt chuẩn xác 50 câu
    const finalQuestions = this.shuffle(selectedQuestions).slice(0, DEFAULT_QUESTIONS);

    // Lưu session luyện tập
    const session_id = await practiceSessionDAO.create({
      user_id,
      subject_id,
      mode: 'personalized',
      total_questions: finalQuestions.length,
      duration: DEFAULT_DURATION
    });

    const answers = finalQuestions.map(q => ({ question_id: q.question_id, user_ans: null as string | null, is_correct: false }));
    await practiceSessionDAO.saveAnswers(session_id, answers);

    return { session_id, questions: finalQuestions.map(q => QuestionModel.fromRow(q).toStudentJSON()) };
  }

  // SỬA LỖI BƯỚC 1: Đúng hoàn toàn cấu trúc rẽ nhánh ưu tiên của bảng đặc tả
  private computeDifficultyDistribution(diffAcc: Record<string, number>): Record<string, number> {
    const easyAcc = diffAcc['1'];
    const medAcc = diffAcc['2'];

    // Sinh viên chưa có lịch sử (hoặc rỗng)
    if (easyAcc === undefined && medAcc === undefined) {
      return { '1': 0.40, '2': 0.40, '3': 0.20 };
    }
    // Tỉ lệ đúng mức trung bình >= 80% (Ưu tiên mức độ khó cao nhất trước)
    if (medAcc !== undefined && medAcc >= 0.80) {
      return { '1': 0.20, '2': 0.20, '3': 0.60 };
    }
    // Tỉ lệ đúng mức dễ >= 80%
    if (easyAcc !== undefined && easyAcc >= 0.80) {
      return { '1': 0.20, '2': 0.40, '3': 0.40 };
    }
    // Tỉ lệ đúng mức dễ < 50%
    if (easyAcc !== undefined && easyAcc < 0.50) {
      return { '1': 0.60, '2': 0.30, '3': 0.10 };
    }
    // Các trường hợp còn lại
    return { '1': 0.30, '2': 0.40, '3': 0.30 };
  }

  // ĐÚNG BƯỚC 2: Tính trọng số chương = 1 - tỉ lệ chính xác (mặc định chưa làm = 0.8)
  private computeChapterWeights(chapterIds: number[], chapterAcc: Record<string, number>): Record<string, number> {
    const weights: Record<string, number> = {};
    for (const id of chapterIds) {
      const acc = chapterAcc[String(id)];
      weights[String(id)] = acc !== undefined ? Math.max(0.01, 1 - acc) : 0.8; // Tránh trọng số bằng 0 tuyệt đối bằng Math.max
    }
    return weights;
  }

  // ĐÚNG BƯỚC 3: Trọng số câu hỏi = Trọng số nền * Hệ số lặp
  private computeQuestionWeights(questions: QuestionRow[], statusMap: Map<number, UserQuestionStatusRow>): WeightedQuestion[] {
    return questions.map(q => {
      const status = statusMap.get(q.question_id);

      // Nếu chưa từng làm
      if (!status) return { question: q, weight: 1.0 }; // nền 1.0 * lặp 1.0 = 1.0

      const total = status.correct_count + status.wrong_count;
      if (total === 0) return { question: q, weight: 1.0 };

      // 1. Trọng số nền
      const baseWeight = 1 - (status.correct_count / total);

      // 2. Hệ số lặp
      const repeatFactor = status.is_latest_correct === false ? 1.5 : 1.0;

      return { question: q, weight: Math.max(0.01, baseWeight * repeatFactor) };
    });
  }

  // Thuật toán chọn mẫu ngẫu nhiên theo trọng số Roulette-Wheel (Đã chuẩn)
  private weightedSample(items: WeightedQuestion[], count: number): QuestionRow[] {
    const result: QuestionRow[] = [];
    const pool = [...items];
    for (let i = 0; i < count && pool.length > 0; i++) {
      const totalW = pool.reduce((s, item) => s + item.weight, 0);
      let rand = Math.random() * totalW;
      let idx = 0;
      for (let j = 0; j < pool.length; j++) {
        rand -= pool[j].weight;
        if (rand <= 0) { idx = j; break; }
      }
      result.push(pool[idx].question);
      pool.splice(idx, 1); // Loại bỏ câu đã chọn ra khỏi hồ chứa để tránh trùng lặp
    }
    return result;
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private parseJSON(val: unknown): Record<string, number> {
    if (!val) return {};
    if (typeof val === 'object') return val as Record<string, number>;
    try { return JSON.parse(val as string); } catch { return {}; }
  }
}

export const personalizedService = new PersonalizedService();