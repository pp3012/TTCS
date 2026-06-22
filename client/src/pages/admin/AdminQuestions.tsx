import { useEffect, useState, useRef } from 'react';
import { questionApi, subjectApi } from '../../services/api';
import { Question, Subject, Chapter } from '../../types';

const EMPTY_Q = { subject_id: 0, chapter_id: 0, level_id: 1, type_id: 1, content: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', explanation: '' };

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
    setForm({ subject_id: q.subject_id, chapter_id: q.chapter_id || 0, level_id: q.level_id || 1, type_id: q.type_id || 1, content: q.content, option_a: q.option_a || '', option_b: q.option_b || '', option_c: q.option_c || '', option_d: q.option_d || '', correct_option: q.correct_option || 'A', explanation: q.explanation || '' });
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
    await questionApi.delete(id); load();
  };

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { setImportMsg('Vui lòng chọn file'); return; }
    try {
      const r = await questionApi.importExcel(file, importSubject);
      setImportMsg(r.data.message || 'Thành công');
      load();
    } catch (err: unknown) {
      setImportMsg((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi');
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

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
          <thead><tr><th style={{width:40}}>ID</th><th>Nội dung</th><th>Chương</th><th>Độ khó</th><th>Loại</th><th>Đáp án</th><th>Thao tác</th></tr></thead>
          <tbody>
            {questions.map(q => (
              <tr key={q.question_id}>
                <td>{q.question_id}</td>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Chương</label>
                <select className="form-control" value={form.chapter_id} onChange={set('chapter_id')}>
                  <option value={0}>-- Chọn --</option>
                  {chapters.map(c => <option key={c.chapter_id} value={c.chapter_id}>{c.chapter_name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Độ khó</label>
                <select className="form-control" value={form.level_id} onChange={set('level_id')}>
                  <option value={1}>Dễ</option><option value={2}>Trung bình</option><option value={3}>Khó</option>
                </select>
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Loại</label>
                <select className="form-control" value={form.type_id} onChange={set('type_id')}>
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
            <p className="text-muted" style={{ marginBottom: 16 }}>File Excel cần có các cột: content, option_a, option_b, option_c, option_d, correct_option, chapter_id, level_id, type_id, explanation</p>
            <div className="form-group">
              <label className="form-label">Môn học</label>
              <select className="form-control" value={importSubject} onChange={e => setImportSubject(Number(e.target.value))}>
                {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Chọn file</label>
              <input type="file" ref={fileRef} accept=".xlsx,.xls" className="form-control" />
            </div>
            {importMsg && <div style={{ padding: 10, background: 'var(--gray-50)', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{importMsg}</div>}
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
