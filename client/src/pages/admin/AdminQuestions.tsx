import { useEffect, useState, useRef } from 'react';
import { questionApi, subjectApi } from '../../services/api';
import { Question, Subject, Chapter } from '../../types';

const EMPTY_Q = { subject_id: 0, chapter_id: 0, level_id: 0, type_id: 0, content: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', explanation: '' };

export default function AdminQuestions() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [subjectFilter, setSubjectFilter] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_Q);
  const [editId, setEditId] = useState<number | null>(null);
  const [importSubject, setImportSubject] = useState(0);
  const [showImport, setShowImport] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const LIMIT = 15;

  useEffect(() => { subjectApi.getAll().then(r => { const s = r.data.data || []; setSubjects(s); if (s.length > 0) { setSubjectFilter(s[0].subject_id); setImportSubject(s[0].subject_id); } }); }, []);

  useEffect(() => {
    if (!subjectFilter) return;
    setLoading(true);
    Promise.all([
      questionApi.getBySubject(subjectFilter, { page, limit: LIMIT, search: searchTerm.trim() || undefined }),
      subjectApi.getById(subjectFilter),
    ]).then(([qr, sr]) => {
      setQuestions(qr.data.data || []); setTotal(qr.data.total || 0);
      setChapters(sr.data.data?.chapters || []);
    }).finally(() => setLoading(false));
  }, [subjectFilter, page, searchTerm]);

  const load = () => {
    questionApi.getBySubject(subjectFilter, { page, limit: LIMIT, search: searchTerm.trim() || undefined })
      .then(r => { setQuestions(r.data.data || []); setTotal(r.data.total || 0); });
  };

  const openCreate = () => { setEditId(null); setForm({ ...EMPTY_Q, subject_id: subjectFilter }); setShowModal(true); };
  const openEdit = (q: Question) => {
    setEditId(q.question_id);
    setForm({ subject_id: q.subject_id, chapter_id: q.chapter_id || 0, level_id: q.level_id || 0, type_id: q.type_id || 0, content: q.content, option_a: q.option_a || '', option_b: q.option_b || '', option_c: q.option_c || '', option_d: q.option_d || '', correct_option: q.correct_option || 'A', explanation: q.explanation || '' });
    setShowModal(true);
  };

  const save = async () => {
    try {
      if (editId) await questionApi.update(editId, form);
      else await questionApi.create(form);
      setShowModal(false); load();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa câu hỏi này?')) return;
    try {
      await questionApi.delete(id);
      load();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể xóa câu hỏi này');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await questionApi.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Template_NhapCauHoi.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert('Có lỗi khi tải template');
    }
  };

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { setImportMsg('Vui lòng chọn file'); return; }
    try {
      const r = await questionApi.importExcel(file, importSubject);
      let msg = r.data.message || 'Thành công';
      if (r.data.errors && r.data.errors.length > 0) {
        msg += '\n\nChi tiết lỗi:\n- ' + r.data.errors.join('\n- ');
      }
      setImportMsg(msg);
      load();
    } catch (err: unknown) {
      setImportMsg((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi');
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setForm(f => ({ ...f, [field]: field.endsWith('_id') ? Number(val) : val }));
  };

  const handleModalSubjectChange = (subjectId: number) => {
    setForm(f => ({ ...f, subject_id: subjectId, chapter_id: 0 }));
    // Load lại chương của môn được chọn trong modal
    subjectApi.getById(subjectId).then(r => setChapters(r.data.data?.chapters || []));
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title">Quản lý câu hỏi</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setShowImport(true)}>Nhập Excel</button>
          <button className="btn btn-primary" onClick={openCreate}>+ Thêm câu hỏi</button>
        </div>
      </div>

      <div className="filter-bar">
        <select className="filter-select" value={subjectFilter} onChange={e => { setSubjectFilter(Number(e.target.value)); setPage(1); }}>
          {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
        </select>
        <input
          className="search-input"
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
          placeholder="Tìm theo nội dung, chương, độ khó hoặc loại..."
        />
        <span className="text-muted">{total} câu hỏi</span>
      </div>

      {loading ? <div className="loading"></div> : questions.length === 0 ? (
        <div className="empty-state">Không tìm thấy câu hỏi phù hợp.</div>
      ) : (
        <table className="admin-table">
          <thead><tr><th style={{ width: 40 }}>STT</th><th>Nội dung</th><th>Chương</th><th>Độ khó</th><th>Loại</th><th>Đáp án</th><th>Thao tác</th></tr></thead>
          <tbody>
            {questions.map((q, idx) => (
              <tr key={q.question_id}>
                <td>{(page - 1) * LIMIT + idx + 1}</td>
                <td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.content}</td>
                <td><span className="badge badge-gray">{q.chapter_name || '—'}</span></td>
                <td><span className="badge badge-orange">{q.level_name || '—'}</span></td>
                <td><span className="badge badge-purple">{q.type_name || '—'}</span></td>
                <td style={{ fontWeight: 700, color: 'var(--success)' }}>{q.correct_option}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => openEdit(q)}>Sửa️</button>
                    <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => handleDelete(q.question_id)}>Xoá️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editId ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}</h2>
            {/* Dropdown chọn môn học — chỉ hiển thị khi tạo mới; khi edit thì hiện readonly */}
            <div className="form-group">
              <label className="form-label">Môn học *</label>
              {editId ? (
                <input
                  className="form-control"
                  value={subjects.find(s => s.subject_id === form.subject_id)?.subject_name || ''}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed', background: 'var(--gray-100, #f3f4f6)' }}
                />
              ) : (
                <select className="form-control" value={form.subject_id}
                  onChange={e => handleModalSubjectChange(Number(e.target.value))}>
                  <option value={0}>-- Chọn môn --</option>
                  {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
                </select>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Chương</label>
                <select className="form-control" value={form.chapter_id} onChange={set('chapter_id')}>
                  <option value={0}>-- Chọn --</option>
                  {chapters.map(c => <option key={c.chapter_id} value={c.chapter_id}>{c.chapter_name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Độ khó</label>
                <select className="form-control" value={form.level_id} onChange={set('level_id')}>
                  <option value={0}>-- Chọn --</option>
                  <option value={1}>Dễ</option><option value={2}>Trung bình</option><option value={3}>Khó</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Loại</label>
                <select className="form-control" value={form.type_id} onChange={set('type_id')}>
                  <option value={0}>-- Chọn --</option>
                  <option value={1}>Lý thuyết</option><option value={2}>Bài tập</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nội dung câu hỏi *</label>
              <textarea className="form-control" rows={3} value={form.content} onChange={set('content')} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group"><label className="form-label">Đáp án A *</label><input className="form-control" value={form.option_a} onChange={set('option_a')} /></div>
              <div className="form-group"><label className="form-label">Đáp án B *</label><input className="form-control" value={form.option_b} onChange={set('option_b')} /></div>
              <div className="form-group"><label className="form-label">Đáp án C *</label><input className="form-control" value={form.option_c} onChange={set('option_c')} /></div>
              <div className="form-group"><label className="form-label">Đáp án D *</label><input className="form-control" value={form.option_d} onChange={set('option_d')} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">Đáp án đúng *</label>
                <select className="form-control" value={form.correct_option} onChange={set('correct_option')}>
                  <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Giải thích</label>
                <input className="form-control" value={form.explanation} onChange={set('explanation')} placeholder="(tuỳ chọn)" />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={save}> {editId ? 'Cập nhật' : 'Tạo mới'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {showImport && (
        <div className="modal-overlay" onClick={() => { setShowImport(false); setImportMsg(''); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title"> Nhập câu hỏi từ Excel</h2>
            <div style={{ marginBottom: 16, fontSize: 13 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', lineHeight: 1.6 }}>
                <thead>
                  <tr style={{ background: 'var(--gray-100, #f3f4f6)', textAlign: 'left' }}>
                    <th style={{ padding: '6px 10px', border: '1px solid var(--gray-200, #e5e7eb)' }}>Tên cột trong file</th>
                    <th style={{ padding: '6px 10px', border: '1px solid var(--gray-200, #e5e7eb)' }}>Ý nghĩa</th>
                    <th style={{ padding: '6px 10px', border: '1px solid var(--gray-200, #e5e7eb)' }}>Bắt buộc</th>
                    <th style={{ padding: '6px 10px', border: '1px solid var(--gray-200, #e5e7eb)' }}>Giá trị hợp lệ</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { col: 'content',        label: 'Nội dung câu hỏi', req: true,  note: 'Câu hỏi đầy đủ' },
                    { col: 'option_a',       label: 'Đáp án A',         req: true,  note: 'Nội dung đáp án A' },
                    { col: 'option_b',       label: 'Đáp án B',         req: true,  note: 'Nội dung đáp án B' },
                    { col: 'option_c',       label: 'Đáp án C',         req: true,  note: 'Nội dung đáp án C' },
                    { col: 'option_d',       label: 'Đáp án D',         req: true,  note: 'Nội dung đáp án D' },
                    { col: 'correct_option', label: 'Đáp án đúng',      req: true,  note: 'A  hoặc  B  hoặc  C  hoặc  D' },
                    { col: 'chapter_id',     label: 'Chương',           req: false, note: 'Số thứ tự chương của môn được chọn (1, 2, 3...)' },
                    { col: 'level_id',       label: 'Độ khó',           req: false, note: 'dễ  |  trung bình  |  khó  (hoặc 1 / 2 / 3)' },
                    { col: 'type_id',        label: 'Loại câu hỏi',     req: false, note: 'lý thuyết  |  bài tập  (hoặc 1 / 2)' },
                    { col: 'explanation',    label: 'Giải thích',        req: false, note: 'Giải thích đáp án (có thể bỏ trống)' },
                  ].map(({ col, label, req, note }) => (
                    <tr key={col}>
                      <td style={{ padding: '5px 10px', border: '1px solid var(--gray-200, #e5e7eb)', fontFamily: 'monospace', fontWeight: 600, whiteSpace: 'nowrap' }}>{col}</td>
                      <td style={{ padding: '5px 10px', border: '1px solid var(--gray-200, #e5e7eb)' }}>{label}</td>
                      <td style={{ padding: '5px 10px', border: '1px solid var(--gray-200, #e5e7eb)', textAlign: 'center' }}>
                        {req ? <span style={{ color: 'var(--danger, #ef4444)', fontWeight: 700 }}>✓ Có</span>
                              : <span style={{ color: 'var(--gray-400, #9ca3af)' }}>Không</span>}
                      </td>
                      <td style={{ padding: '5px 10px', border: '1px solid var(--gray-200, #e5e7eb)', color: 'var(--gray-600, #4b5563)' }}>{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ marginTop: 8, color: 'var(--gray-400, #9ca3af)' }}>
                ℹ️ Thứ tự cột không quan trọng. Cột lạ hoặc không có trong danh sách trên sẽ bị bỏ qua.
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">Môn học</label>
              <select className="form-control" value={importSubject} onChange={e => setImportSubject(Number(e.target.value))}>
                {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Chọn file</span>
                <a href="#" onClick={(e) => { e.preventDefault(); handleDownloadTemplate(); }} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Tải file mẫu Excel</a>
              </label>
              <input type="file" ref={fileRef} accept=".xlsx,.xls" className="form-control" />
            </div>
            {importMsg && (
              <div style={{ padding: 12, background: 'var(--gray-50)', borderRadius: 8, fontSize: 13, marginBottom: 16, whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto', border: '1px solid var(--gray-200)' }}>
                {importMsg}
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setShowImport(false); setImportMsg(''); }}>Đóng</button>
              <button className="btn btn-primary" onClick={handleImport}> Nhập</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
