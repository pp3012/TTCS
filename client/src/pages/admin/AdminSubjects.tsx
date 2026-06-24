import { useEffect, useMemo, useState } from 'react';
import { subjectApi } from '../../services/api';
import { Subject } from '../../types';

const EMPTY_FORM = { subject_name: '', description: '', total_chapter: 0 as number | string };

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [showChapterModal, setShowChapterModal] = useState(false);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<{ chapter_id?: number, chapter_name: string, isNew?: boolean }[]>([]);
  const [savingChapters, setSavingChapters] = useState(false);

  const load = () => {
    setLoading(true);
    subjectApi.getAll()
      .then(r => setSubjects(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditSubject(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const openEdit = (s: Subject) => {
    setEditSubject(s);
    setForm({ subject_name: s.subject_name, description: s.description || '', total_chapter: s.total_chapter || 0 });
    setError('');
    setShowModal(true);
  };

  const save = async () => {
    if (!form.subject_name.trim()) { setError('Vui lòng nhập tên môn học'); return; }
    if (Number(form.total_chapter) < 0) { setError('Tổng số chương không được nhỏ hơn 0'); return; }
    setSaving(true);
    try {
      if (editSubject) {
        await subjectApi.update(editSubject.subject_id, form);
      } else {
        await subjectApi.create(form);
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: Subject) => {
    if (!confirm(`Xoá môn học "${s.subject_name}"? Thao tác này không thể hoàn tác.`)) return;
    try {
      await subjectApi.delete(s.subject_id);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể xoá môn học này');
    }
  };

  const handleConfigChapters = async (s: Subject) => {
    setActiveSubject(s);
    setShowChapterModal(true);
    setChapters([]);
    try {
      const res = await subjectApi.getById(s.subject_id);
      if (res.data.data && res.data.data.chapters) {
        setChapters(res.data.data.chapters);
      }
    } catch (err) {
      alert('Không thể tải danh sách chương');
    }
  };

  const handleAddChapterRow = () => {
    setChapters([...chapters, { chapter_name: `Chương ${chapters.length + 1}`, isNew: true }]);
  };

  const handleChapterNameChange = (index: number, newName: string) => {
    const newChapters = [...chapters];
    newChapters[index].chapter_name = newName;
    setChapters(newChapters);
  };

  const saveChapters = async () => {
    if (!activeSubject) return;
    setSavingChapters(true);
    try {
      for (const ch of chapters) {
        if (ch.isNew) {
          await subjectApi.addChapter(activeSubject.subject_id, ch.chapter_name);
        } else if (ch.chapter_id) {
          await subjectApi.updateChapter(activeSubject.subject_id, ch.chapter_id, ch.chapter_name);
        }
      }
      setShowChapterModal(false);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Có lỗi khi lưu chương');
    } finally {
      setSavingChapters(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let val: string | number = e.target.value;
    if (field === 'total_chapter') {
      val = val === '' ? '' : Number(val);
    }
    setForm(f => ({ ...f, [field]: val }));
  };

  const filteredSubjects = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return subjects;

    return subjects.filter(subject => {
      const name = subject.subject_name.toLowerCase();
      return name.includes(keyword);
    });
  }, [subjects, searchTerm]);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Quản lý môn học</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>{subjects.length} môn học trong hệ thống</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>＋ Thêm môn học</button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <input
          className="search-input"
          style={{ width: '100%', maxWidth: 400 }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm theo tên môn học..."
        />
        <span className="text-muted">{filteredSubjects.length} kết quả</span>
      </div>

      {loading ? (
        <div className="loading"> Đang tải...</div>
      ) : subjects.length === 0 ? (
        <div className="empty-state">
          Chưa có môn học nào. Hãy thêm môn học đầu tiên!
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="empty-state">Không tìm thấy môn học phù hợp.</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              {/* Thay đổi tiêu đề cột ở đây */}
              <th style={{ width: 50, textAlign: 'center' }}>STT</th>
              <th>Tên môn học</th>
              <th>Mô tả</th>
              <th style={{ width: 140 }}>Tổng số chương</th>
              <th style={{ width: 240, textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.map((s, idx) => (
              <tr key={s.subject_id}>
                {/* Hiển thị số thứ tự tự động tăng thay vì s.subject_id */}
                <td style={{ textAlign: 'center', color: 'var(--gray-500)' }}>{idx + 1}</td>
                <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{s.subject_name}</td>
                <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.description || <span className="text-muted">Chưa có mô tả</span>}
                </td>
                <td>
                  <span className="badge badge-blue">{s.total_chapter || 0} chương</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '5px 10px', fontSize: 12 }}
                      onClick={() => handleConfigChapters(s)}
                    >
                      Cài đặt chương
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '5px 10px', fontSize: 12 }}
                      onClick={() => openEdit(s)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '5px 10px', fontSize: 12 }}
                      onClick={() => handleDelete(s)}
                    >
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editSubject ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}</h2>

            {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

            <div className="form-group">
              <label className="form-label">Tên môn học <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="form-control" value={form.subject_name} onChange={set('subject_name')} placeholder="VD: Lập trình Web" />
            </div>
            <div className="form-group">
              <label className="form-label">Tổng số chương</label>
              <input className="form-control" type="number" min={0} value={form.total_chapter} onChange={set('total_chapter')} placeholder="VD: 5" />
            </div>
            <div className="form-group">
              <label className="form-label">Mô tả</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={set('description')} placeholder="Mô tả ngắn về môn học..." />
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Huỷ</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Đang lưu...' : `${editSubject ? 'Cập nhật' : 'Tạo mới'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapters Modal */}
      {showChapterModal && activeSubject && (
        <div className="modal-overlay" onClick={() => setShowChapterModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <h2 className="modal-title">Cài đặt chương: {activeSubject.subject_name}</h2>

            <div className="form-group" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {chapters.length === 0 ? (
                <div className="text-muted" style={{ marginBottom: 16 }}>Chưa có chương nào.</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>STT</th>
                      <th>Tên chương</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chapters.map((ch, idx) => (
                      <tr key={ch.chapter_id || `new-${idx}`}>
                        <td>{idx + 1}</td>
                        <td>
                          <input
                            className="form-control"
                            value={ch.chapter_name}
                            onChange={(e) => handleChapterNameChange(idx, e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <button className="btn btn-secondary" onClick={handleAddChapterRow} style={{ marginTop: 16 }}>＋ Thêm chương</button>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowChapterModal(false)}>Đóng</button>
              <button className="btn btn-primary" onClick={saveChapters} disabled={savingChapters}>
                {savingChapters ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}