import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { User } from '../../types';

const EMPTY_ADD = { user_name: '', email: '', password: '', full_name: '', role: 'student' };

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit modal
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ email: '', full_name: '' });

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD);
  const [addError, setAddError] = useState('');
  const [saving, setSaving] = useState(false);

  const LIMIT = 15;

  const load = () => {
    setLoading(true);
    adminApi.getUsers({ page, limit: LIMIT, search: search.trim() || undefined })
      .then(r => { setUsers(r.data.data || []); setTotal(r.data.total || 0); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, search]);

  const handleDelete = async (u: User) => {
    if (!confirm(`Bạn có chắc muốn xóa tài khoản "${u.user_name}"?`)) return;
    try {
      await adminApi.deleteUser(u.user_id);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể xoá người dùng này');
    }
  };

  const handleEdit = (u: User) => {
    setEditUser(u);
    setEditForm({ email: u.email, full_name: u.full_name || '' });
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await adminApi.updateUser(editUser.user_id, editForm);
      setEditUser(null);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  const saveAdd = async () => {
    if (!addForm.user_name.trim() || !addForm.email.trim() || !addForm.password.trim()) {
      setAddError('Vui lòng điền đầy đủ các trường bắt buộc (*).'); return;
    }
    setSaving(true);
    setAddError('');
    try {
      await (adminApi as any).createUser(addForm);
      setShowAdd(false);
      setAddForm(EMPTY_ADD);
      load();
    } catch (err: any) {
      setAddError(err?.response?.data?.message || 'Không thể tạo người dùng');
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Quản lý người dùng</h1>
          <span className="text-muted">{total} tài khoản trong hệ thống</span>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowAdd(true); setAddForm(EMPTY_ADD); setAddError(''); }}>
          ＋ Thêm người dùng
        </button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <input
          className="search-input"
          placeholder="Tìm theo tên đăng nhập hoặc email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {loading ? <div className="loading"> Đang tải...</div> : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên đăng nhập</th>
                <th>Email</th>
                <th>Họ tên</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 32 }}>Không tìm thấy người dùng</td></tr>
              ) : users.map(u => (
                <tr key={u.user_id}>
                  <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>#{u.user_id}</td>
                  <td style={{ fontWeight: 600 }}>{u.user_name}</td>
                  <td>{u.email}</td>
                  <td>{u.full_name || '—'}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>{u.role === 'admin' ? ' Admin' : ' Sinh viên'}</span></td>
                  <td style={{ fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => handleEdit(u)}> Sửa</button>
                      <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => handleDelete(u)} disabled={u.role === 'admin'}>️ Xoá</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          )}
        </>
      )}

      {/* ── Edit modal ── */}
      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title"> Chỉnh sửa: {editUser.user_name}</h2>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              <input className="form-control" value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setEditUser(null)}>Huỷ</button>
              <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>
                {saving ? ' Đang lưu...' : ' Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add modal ── */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title"> Thêm người dùng mới</h2>
            {addError && <div className="auth-error" style={{ marginBottom: 16 }}>{addError}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tên đăng nhập <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input className="form-control" value={addForm.user_name} onChange={e => setAddForm(f => ({ ...f, user_name: e.target.value }))} placeholder="username" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Họ và tên</label>
                <input className="form-control" value={addForm.full_name} onChange={e => setAddForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Nguyễn Văn A" />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">Email <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="form-control" type="email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} placeholder="example@email.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="form-control" type="password" value={addForm.password} onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))} placeholder="Tối thiểu 6 ký tự" />
            </div>
            <div className="form-group">
              <label className="form-label">Vai trò</label>
              <select className="form-control" value={addForm.role} onChange={e => setAddForm(f => ({ ...f, role: e.target.value }))}>
                <option value="student"> Sinh viên</option>
                <option value="admin"> Admin</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Huỷ</button>
              <button className="btn btn-primary" onClick={saveAdd} disabled={saving}>
                {saving ? ' Đang tạo...' : ' Thêm người dùng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
