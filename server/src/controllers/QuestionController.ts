import { Request, Response } from 'express';
import { questionDAO } from '../dao/QuestionDAO';
import { subjectDAO } from '../dao/SubjectDAO';
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
      const question_id = Number(req.params.id);
      const hasHistory = await questionDAO.hasPracticeHistory(question_id);
      if (hasHistory) {
        res.status(400).json({ success: false, message: 'Không thể xóa câu hỏi này vì đã có lịch sử luyện tập' });
        return;
      }
      await questionDAO.delete(question_id);
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

      // Load danh sách chương của môn được chọn — dùng để map số thứ tự (order_index) trong Excel → chapter_id đúng
      const subjectChapters = await subjectDAO.findChaptersBySubject(subject_id);
      // Map: order_index -> chapter_id (ví dụ: 1 -> 5, 2 -> 6 nếu môn 2 có chapter_id 5,6)
      const chapterByOrder = new Map<number, number>();
      subjectChapters.forEach(c => chapterByOrder.set(c.order_index, c.chapter_id));

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

      let importedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // Chuyển toàn bộ tên cột thành chữ thường để so sánh cho an toàn
        const lowerRow: Record<string, string> = {};
        for (const key in row) {
          lowerRow[key.toLowerCase().trim()] = String(row[key]);
        }

        const findKey = (keywords: string[]) => Object.keys(lowerRow).find(k => keywords.some(kw => k.includes(kw)));

        const chapterKey = findKey(['chapter_id', 'chương']);
        const levelKey = findKey(['level_id', 'độ khó', 'mức độ']);
        const typeKey = findKey(['type_id', 'loại']);
        const contentKey = findKey(['content', 'nội dung']);
        const optAKey = findKey(['option_a', 'đáp án a']);
        const optBKey = findKey(['option_b', 'đáp án b']);
        const optCKey = findKey(['option_c', 'đáp án c']);
        const optDKey = findKey(['option_d', 'đáp án d']);
        const correctKey = findKey(['correct_option', 'đáp án đúng']);
        const explKey = findKey(['explanation', 'giải thích']);

        const parseNum = (val: any) => {
          if (!val) return undefined;
          const n = Number(val);
          return isNaN(n) || n === 0 ? undefined : n;
        };

        // Map số thứ tự chương trong Excel → chapter_id thực tế trong DB của môn đó
        const parseChapterId = (val: any): number | undefined => {
          if (!val) return undefined;
          const orderNum = Number(val);
          if (isNaN(orderNum) || orderNum === 0) return undefined;
          const realId = chapterByOrder.get(orderNum);
          if (!realId) {
            // Chương không tồn tại trong môn này — trả về -1 để báo lỗi
            return -1;
          }
          return realId;
        };

        // Map chữ → ID cho độ khó (level)
        const parseLevelId = (val: any): number | undefined => {
          if (!val) return undefined;
          const s = String(val).toLowerCase().trim();
          if (s === '1' || s === 'dễ' || s === 'de') return 1;
          if (s === '2' || s === 'trung bình' || s === 'trung binh' || s === 'tb') return 2;
          if (s === '3' || s === 'khó' || s === 'kho') return 3;
          const n = Number(val);
          return isNaN(n) || n === 0 ? undefined : n;
        };

        // Map chữ → ID cho loại câu hỏi (type)
        const parseTypeId = (val: any): number | undefined => {
          if (!val) return undefined;
          const s = String(val).toLowerCase().trim();
          if (s === '1' || s === 'lý thuyết' || s === 'ly thuyet' || s === 'lí thuyết') return 1;
          if (s === '2' || s === 'bài tập' || s === 'bai tap') return 2;
          const n = Number(val);
          return isNaN(n) || n === 0 ? undefined : n;
        };

        const rawChapterId = chapterKey ? parseChapterId(lowerRow[chapterKey]) : undefined;

        // Báo lỗi nếu số chương không tồn tại trong môn
        if (rawChapterId === -1) {
          const orderVal = chapterKey ? lowerRow[chapterKey] : '?';
          errors.push(`Dòng ${i + 2}: Chương số ${orderVal} không tồn tại trong môn này`);
          continue;
        }

        const data = {
          subject_id,
          chapter_id: rawChapterId,
          level_id: levelKey ? parseLevelId(lowerRow[levelKey]) : undefined,
          type_id: typeKey ? parseTypeId(lowerRow[typeKey]) : undefined,
          content: contentKey ? lowerRow[contentKey] : '',
          option_a: optAKey ? lowerRow[optAKey] : '',
          option_b: optBKey ? lowerRow[optBKey] : '',
          option_c: optCKey ? lowerRow[optCKey] : '',
          option_d: optDKey ? lowerRow[optDKey] : '',
          correct_option: correctKey ? lowerRow[correctKey].toUpperCase().trim() : '',
          explanation: explKey ? lowerRow[explKey] : undefined,
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
