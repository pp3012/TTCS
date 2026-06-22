import { Request, Response } from 'express';
import { questionDAO } from '../dao/QuestionDAO';
import { QuestionModel} from '../models/Question';
import { validateCreateQuestion } from '../dto/QuestionDTO';
import * as XLSX from 'xlsx';

type AuthRequest = Request & { user?: { user_id: number; role: string } };

export class QuestionController {
  async getBySubject(req: Request, res: Response): Promise<void> {
    try {
      const subject_id = Number(req.params.subjectId);
      const { chapter_id, level_id, type_id, page, limit, search } = req.query;
      const result = await questionDAO.findBySubject(subject_id, {
        chapter_id: chapter_id ? Number(chapter_id) : undefined,
        level_id: level_id ? Number(level_id) : undefined,
        type_id: type_id ? Number(type_id) : undefined,
        search: typeof search === 'string' ? search : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      // Admin gets full data, student gets student view
      const isAdmin = (req as AuthRequest).user?.role === 'admin';
      const data = result.questions.map(q =>
        isAdmin ? QuestionModel.fromRow(q).toFullJSON() : QuestionModel.fromRow(q).toStudentJSON()
      );
      res.json({ success: true, data, total: result.total });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const q = await questionDAO.findById(Number(req.params.id));
      if (!q) { res.status(404).json({ success: false, message: 'Câu hỏi không tồn tại' }); return; }
      const isAdmin = req.user?.role === 'admin';
      res.json({ success: true, data: isAdmin ? QuestionModel.fromRow(q).toFullJSON() : QuestionModel.fromRow(q).toStudentJSON() });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validateCreateQuestion(req.body);
      if (errors.length > 0) { res.status(400).json({ success: false, message: errors.join('; ') }); return; }
      const id = await questionDAO.create(req.body);
      const q = await questionDAO.findById(id);
      res.status(201).json({ success: true, data: QuestionModel.fromRow(q!).toFullJSON() });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const question_id = Number(req.params.id);
      const existing = await questionDAO.findById(question_id);
      if (!existing) { res.status(404).json({ success: false, message: 'Câu hỏi không tồn tại' }); return; }
      await questionDAO.update(question_id, req.body);
      const q = await questionDAO.findById(question_id);
      res.json({ success: true, data: QuestionModel.fromRow(q!).toFullJSON() });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await questionDAO.delete(Number(req.params.id));
      res.json({ success: true, message: 'Đã xóa câu hỏi' });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async importFromExcel(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) { res.status(400).json({ success: false, message: 'Vui lòng tải lên file Excel' }); return; }
      const subject_id = Number(req.body.subject_id);
      if (!subject_id) { res.status(400).json({ success: false, message: 'Thiếu subject_id' }); return; }

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

      let importedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const data = {
          subject_id,
          chapter_id: row['chapter_id'] ? Number(row['chapter_id']) : undefined,
          level_id: row['level_id'] ? Number(row['level_id']) : undefined,
          type_id: row['type_id'] ? Number(row['type_id']) : undefined,
          content: row['content'] || '',
          option_a: row['option_a'] || '',
          option_b: row['option_b'] || '',
          option_c: row['option_c'] || '',
          option_d: row['option_d'] || '',
          correct_option: row['correct_option'] || '',
          explanation: row['explanation'] || undefined,
        };
        const errs = validateCreateQuestion(data);
        if (errs.length > 0) { errors.push(`Dòng ${i + 2}: ${errs.join(', ')}`); continue; }
        await questionDAO.create(data);
        importedCount++;
      }

      res.json({ success: true, message: `Nhập thành công ${importedCount} câu hỏi`, errors });
    } catch (err: unknown) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }
}

export const questionController = new QuestionController();
