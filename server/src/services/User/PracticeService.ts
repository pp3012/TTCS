import { questionDAO } from '../../dao/QuestionDAO';
import { practiceSessionDAO } from '../../dao/PracticeSessionDAO';
import { userStatsDAO } from '../../dao/UserStatsDAO';
import { QuestionModel, QuestionRow } from '../../models/Question';
import { SubmitSessionDTO } from '../../dto/PracticeSessionDTO';

export class PracticeService {
  // Tạo session luyện tập tự do
  async createFreeSession(user_id: number, subject_id: number, total_questions: number, duration: number, chapter_id?: number): Promise<{
    session_id: number;
    questions: object[];
  }> {
    const questions = await questionDAO.findRandomBySubject(subject_id, total_questions, chapter_id);
    if (questions.length === 0) throw new Error('Môn học hoặc chương này chưa có câu hỏi');
    if (questions.length < total_questions) {
      throw new Error(`Khu vực này chỉ có ${questions.length} câu hỏi, không đủ ${total_questions} câu`);
    }

    const session_id = await practiceSessionDAO.create({
      user_id, subject_id, mode: 'free', total_questions, duration,
    });

    // Lưu các câu hỏi vào session (user_ans = null, is_correct = null ban đầu)
    const answers = questions.map(q => ({ question_id: q.question_id, user_ans: null as string | null, is_correct: false }));
    await practiceSessionDAO.saveAnswers(session_id, answers);

    return {
      session_id,
      questions: questions.map(q => QuestionModel.fromRow(q).toStudentJSON()),
    };
  }

  async getQuestionsBySession(session_id: number, user_id: number): Promise<object[]> {
    // 1. Kiểm tra session có tồn tại và thuộc về user không
    const session = await practiceSessionDAO.findById(session_id);
    if (!session) throw new Error('Phiên luyện tập không tồn tại');
    if (session.user_id !== user_id) throw new Error('Không có quyền truy cập phiên này');

    // Nếu đã nộp bài rồi thì không cho lấy danh sách câu hỏi dạng "đang làm" nữa
    if (session.submit_time) throw new Error('Phiên này đã nộp bài, vui lòng xem kết quả');

    // 2. Lấy danh sách ID câu hỏi từ bảng session_answers (đã lưu lúc create)
    const qIds = await practiceSessionDAO.getSessionQuestionsForInit(session_id);

    if (qIds.length === 0) throw new Error('Không tìm thấy câu hỏi cho phiên này');

    // 3. Lấy chi tiết câu hỏi (Dùng hàm findByIds bạn đã viết trong QuestionDAO)
    const questions = await questionDAO.findByIds(qIds);

    // 4. Trả về format dành cho học sinh (ẨN ĐÁP ÁN ĐÚNG)
    return questions.map(q => QuestionModel.fromRow(q).toStudentJSON());
  }

  // Nộp bài và tính điểm
  async submitSession(session_id: number, user_id: number, dto: SubmitSessionDTO): Promise<object> {
    const session = await practiceSessionDAO.findById(session_id);
    if (!session) throw new Error('Phiên luyện tập không tồn tại');
    if (session.user_id !== user_id) throw new Error('Không có quyền nộp bài này');
    if (session.submit_time) throw new Error('Bài đã được nộp');

    const qIds = dto.answers.map(a => a.question_id);
    const questions = await questionDAO.findByIds(qIds);
    const qMap = new Map(questions.map(q => [q.question_id, q]));

    let correct_count = 0;
    const answersToSave: { question_id: number; user_ans: string | null; is_correct: boolean }[] = [];
    const chapterCorrect: Record<string, { correct: number; total: number }> = {};
    const diffCorrect: Record<string, { correct: number; total: number }> = {};
    const typeCorrect: Record<string, { correct: number; total: number }> = {};

    for (const ans of dto.answers) {
      const q = qMap.get(ans.question_id);
      if (!q) continue;

      const is_correct = !!ans.user_ans && !!q.correct_option && ans.user_ans.toUpperCase() === q.correct_option.toUpperCase();
      if (is_correct) correct_count++;
      answersToSave.push({ question_id: ans.question_id, user_ans: ans.user_ans, is_correct });

      // Cập nhật user_question_status
      await questionDAO.upsertUserQuestionStatus(user_id, ans.question_id, is_correct);

      // Thu thập dữ liệu cho thống kê
      if (q.chapter_id) {
        const key = String(q.chapter_id);
        if (!chapterCorrect[key]) chapterCorrect[key] = { correct: 0, total: 0 };
        chapterCorrect[key].total++;
        if (is_correct) chapterCorrect[key].correct++;
      }
      if (q.level_id) {
        const key = String(q.level_id);
        if (!diffCorrect[key]) diffCorrect[key] = { correct: 0, total: 0 };
        diffCorrect[key].total++;
        if (is_correct) diffCorrect[key].correct++;
      }
      if (q.type_id) {
        const key = String(q.type_id);
        if (!typeCorrect[key]) typeCorrect[key] = { correct: 0, total: 0 };
        typeCorrect[key].total++;
        if (is_correct) typeCorrect[key].correct++;
      }
    }

    const total = dto.answers.length;
    const score = total > 0 ? parseFloat(((correct_count / total) * 10).toFixed(2)) : 0;
    const submit_time = new Date();

    // Cập nhật session
    await practiceSessionDAO.submitSession(session_id, { submit_time, score, correct_count });

    //cập nhật session answer
    await practiceSessionDAO.saveAnswers(session_id, answersToSave);

    // Cập nhật user_stats
    await this.updateUserStats(user_id, session.subject_id, score, chapterCorrect, diffCorrect, typeCorrect);

    // Lấy thông tin đầy đủ để trả về kết quả
    const fullQuestions = await questionDAO.findByIds(qIds);
    const answerMap = new Map(answersToSave.map(a => [a.question_id, a]));

    const start_time = session.start_time ? new Date(session.start_time) : submit_time;
    const duration_actual = Math.floor((submit_time.getTime() - start_time.getTime()) / 1000);

    return {
      session_id,
      score,
      correct_count,
      total_questions: total,
      submit_time,
      duration_actual,
      mode: session.mode,
      subject_id: session.subject_id,
      details: fullQuestions.map(q => ({
        ...QuestionModel.fromRow(q).toFullJSON(),
        user_ans: answerMap.get(q.question_id)?.user_ans || null,
        is_correct: answerMap.get(q.question_id)?.is_correct || false,
      })),
    };
  }

  // Lấy kết quả một session đã nộp
  async getSessionResult(session_id: number, user_id: number): Promise<object> {
    const session = await practiceSessionDAO.findById(session_id);
    if (!session) throw new Error('Phiên luyện tập không tồn tại');
    if (session.user_id !== user_id) throw new Error('Không có quyền xem kết quả này');
    if (!session.submit_time) throw new Error('Bài chưa được nộp');

    const sessionAnswers = await practiceSessionDAO.getSessionAnswers(session_id);
    const qIds = sessionAnswers.map(a => a.question_id);
    const questions = await questionDAO.findByIds(qIds);
    const answerMap = new Map(sessionAnswers.map(a => [a.question_id, a]));

    const start_time = session.start_time ? new Date(session.start_time) : new Date(session.submit_time);
    const submit_time = new Date(session.submit_time);
    const duration_actual = Math.floor((submit_time.getTime() - start_time.getTime()) / 1000);

    return {
      session_id,
      score: session.score,
      correct_count: session.correct_count,
      total_questions: session.total_questions,
      submit_time: session.submit_time,
      start_time: session.start_time,
      duration_actual,
      mode: session.mode,
      subject_id: session.subject_id,
      subject_name: session.subject_name,
      details: questions.map(q => ({
        ...QuestionModel.fromRow(q).toFullJSON(),
        user_ans: answerMap.get(q.question_id)?.user_ans || null,
        is_correct: answerMap.get(q.question_id)?.is_correct || false,
      })),
    };
  }

  private async updateUserStats(
    user_id: number, subject_id: number, score: number,
    chapterCorrect: Record<string, { correct: number; total: number }>,
    diffCorrect: Record<string, { correct: number; total: number }>,
    typeCorrect: Record<string, { correct: number; total: number }>
  ): Promise<void> {
    const existing = await userStatsDAO.findByUserAndSubject(user_id, subject_id);

    // Tính accuracy mới
    const newChapterAcc: Record<string, number> = {};
    const existingChapterAcc = existing ? this.parseJSON(existing.chapter_accuracy) : {};
    for (const [k, v] of Object.entries(chapterCorrect)) {
      const prev = existingChapterAcc[k] || 0;
      // Trung bình trọng số
      newChapterAcc[k] = parseFloat(((prev + (v.correct / v.total)) / (prev > 0 ? 2 : 1)).toFixed(4));
    }
    const mergedChapterAcc = { ...existingChapterAcc, ...newChapterAcc };

    const newDiffAcc: Record<string, number> = {};
    const existingDiffAcc = existing ? this.parseJSON(existing.difficulty_accuracy) : {};
    for (const [k, v] of Object.entries(diffCorrect)) {
      const prev = existingDiffAcc[k] || 0;
      newDiffAcc[k] = parseFloat(((prev + (v.correct / v.total)) / (prev > 0 ? 2 : 1)).toFixed(4));
    }
    const mergedDiffAcc = { ...existingDiffAcc, ...newDiffAcc };

    const newTypeAcc: Record<string, number> = {};
    const existingTypeAcc = existing ? this.parseJSON(existing.type_accuracy) : {};
    for (const [k, v] of Object.entries(typeCorrect)) {
      const prev = existingTypeAcc[k] || 0;
      newTypeAcc[k] = parseFloat(((prev + (v.correct / v.total)) / (prev > 0 ? 2 : 1)).toFixed(4));
    }
    const mergedTypeAcc = { ...existingTypeAcc, ...newTypeAcc };

    const total_sessions = (existing?.total_sessions || 0) + 1;
    const prev_score = existing?.overall_score || 0;
    const overall_score = parseFloat(
      (((prev_score * (total_sessions - 1)) + score) / total_sessions).toFixed(2)
    );

    await userStatsDAO.upsert(user_id, subject_id, {
      total_sessions,
      overall_score,
      chapter_accuracy: mergedChapterAcc,
      difficulty_accuracy: mergedDiffAcc,
      type_accuracy: mergedTypeAcc,
    });
  }

  private parseJSON(val: unknown): Record<string, number> {
    if (!val) return {};
    if (typeof val === 'object') return val as Record<string, number>;
    try { return JSON.parse(val as string); } catch { return {}; }
  }
}

export const practiceService = new PracticeService();
