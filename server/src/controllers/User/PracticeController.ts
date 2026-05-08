import { Request, Response } from 'express';
import { practiceService } from '../../services/User/PracticeService';
import { personalizedService } from '../../services/PersonalizedService';
import { practiceSessionDAO } from '../../dao/PracticeSessionDAO';

type AuthRequest = Request & { user?: { user_id: number; role: string } };

export class PracticeController {
  async createFreeSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user_id = req.user!.user_id;
      const { subject_id, total_questions = 50, time_per_question = 60, chapter_id } = req.body;
      if (!subject_id) { res.status(400).json({ success: false, message: 'Thiếu subject_id' }); return; }
      const validQuestions = [30, 40, 50, 60];
      const validTimes = [30, 50, 60, 90];
      const tq = validQuestions.includes(Number(total_questions)) ? Number(total_questions) : 50;
      const tpq = validTimes.includes(Number(time_per_question)) ? Number(time_per_question) : 60;
      const duration = tq * tpq;
      const result = await practiceService.createFreeSession(user_id, Number(subject_id), tq, duration, chapter_id ? Number(chapter_id) : undefined);
      res.status(201).json({ success: true, data: result });
    } catch (err: unknown) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  async createPersonalizedSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user_id = req.user!.user_id;
      const { subject_id } = req.body;
      if (!subject_id) { res.status(400).json({ success: false, message: 'Thiếu subject_id' }); return; }
      const result = await personalizedService.createPersonalizedSession(user_id, Number(subject_id));
      res.status(201).json({ success: true, data: result });
    } catch (err: unknown) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  async getQuestions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user_id = req.user!.user_id;
      const session_id = Number(req.params.sessionId);

      if (isNaN(session_id)) {
        res.status(400).json({ success: false, message: 'Invalid session_id' });
        return;
      }

      // Gọi hàm getQuestionsBySession từ PracticeService
      const questions = await practiceService.getQuestionsBySession(session_id, user_id);

      res.json({ success: true, data: questions });
    } catch (err: unknown) {
      // 404 nếu không tìm thấy hoặc 403 nếu không có quyền
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  async submitSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user_id = req.user!.user_id;
      const session_id = Number(req.params.sessionId);
      const result = await practiceService.submitSession(session_id, user_id, req.body);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  async getResult(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user_id = req.user!.user_id;
      const session_id = Number(req.params.sessionId);
      const result = await practiceService.getSessionResult(session_id, user_id);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  async getHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user_id = req.user!.user_id;
      const { subject_id, page = 1, limit = 10 } = req.query;
      const result = await practiceSessionDAO.findByUser(user_id, {
        subject_id: subject_id ? Number(subject_id) : undefined,
        page: Number(page),
        limit: Number(limit),
      });
      res.json({ success: true, data: result.sessions, total: result.total, page: Number(page), limit: Number(limit) });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }
}

export const practiceController = new PracticeController();
