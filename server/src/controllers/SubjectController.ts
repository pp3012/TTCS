import { Request, Response } from 'express';
import { subjectDAO } from '../dao/SubjectDAO';
import { questionDAO } from '../dao/QuestionDAO';
import { chapterDAO } from '../dao/ChapterDAO';
import { SubjectModel } from '../models/Subject';
import { validateCreateSubject } from '../dto/SubjectDTO';


type AuthRequest = Request & { user?: { user_id: number; role: string } };

export class SubjectController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const subjects = await subjectDAO.findAll();
      // Enrich with question_count
      res.json({ success: true, data: subjects });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const subject_id = Number(req.params.id);
      const subject = await subjectDAO.findById(subject_id);
      if (!subject) { res.status(404).json({ success: false, message: 'Môn học không tồn tại' }); return; }
      const chapters = await chapterDAO.getChaptersBySubject(subject_id);
      const questionCount = await questionDAO.countBySubject(subject_id);
      res.json({ success: true, data: { ...subject, chapters, question_count: questionCount } });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async getDifficultyLevels(req: Request, res: Response): Promise<void> {
    try {
      const levels = await chapterDAO.getDifficultyLevels();
      res.json({ success: true, data: levels });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async getQuestionTypes(req: Request, res: Response): Promise<void> {
    try {
      const types = await chapterDAO.getQuestionTypes();
      res.json({ success: true, data: types });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validateCreateSubject(req.body);
      if (errors.length > 0) { res.status(400).json({ success: false, message: errors.join('; ') }); return; }
      const id = await subjectDAO.create(req.body);
      const subject = await subjectDAO.findById(id);
      res.status(201).json({ success: true, data: subject });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const subject_id = Number(req.params.id);
      await subjectDAO.update(subject_id, req.body);
      const subject = await subjectDAO.findById(subject_id);
      res.json({ success: true, data: subject });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async addChapter(req: AuthRequest, res: Response): Promise<void> {
    try {
      const subject_id = Number(req.params.id);
      const subject = await subjectDAO.findById(subject_id);
      if (!subject) { res.status(404).json({ success: false, message: 'Môn học không tồn tại' }); return; }

      const chapters = await chapterDAO.getChaptersBySubject(subject_id);
      const orderIndex = chapters.length + 1;
      const chapterName = String(req.body.chapter_name || '').trim() || `Chương ${orderIndex}`;
      await chapterDAO.createChapter({ subject_id, chapter_name: chapterName, order_index: orderIndex });
      await subjectDAO.update(subject_id, { total_chapter: orderIndex });

      const updated = await subjectDAO.findById(subject_id);
      const updatedChapters = await chapterDAO.getChaptersBySubject(subject_id);
      res.status(201).json({ success: true, data: { ...updated, chapters: updatedChapters } });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await subjectDAO.delete(Number(req.params.id));
      res.json({ success: true, message: 'Đã xóa môn học' });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }
}

export const subjectController = new SubjectController();
