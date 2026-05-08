import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { User } from '../../types';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ email: '', full_name: '' });

  const load = () => {
    setLoading(true);
    adminApi.getUsers({ page, limit: 15 })
      .then(r => { setUsers(r.data.data || []); setTotal(r.data.total || 0); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page]);

  const handleDelete = async (u: User) => {
    if (!confirm(`Bạn có chắc muốn xóa tài khoản "${u.user_name}"?`)) return;
    await adminApi.deleteUser(u.user_id);
    load();
  };

  const handleEdit = (u: User) => {
    setEditUser(u);
    setEditForm({ email: u.email, full_name: u.full_name || '' });
  };

  const saveEdit = async () => {
    if (!editUser) return;
    await adminApi.updateUser(editUser.user_id, editForm);
    setEditUser(null);
    load();
  };

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title">Quản lý người dùng</h1>
        <span className="text-muted">{total} tài khoản</span>
      </div>

      {loading ? <div className="loading">⏳</div> : (
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
            {users.map(u => (
              <tr key={u.user_id}>
                <td>{u.user_id}</td>
                <td style={{ fontWeight: 500 }}>{u.user_name}</td>
                <td>{u.email}</td>
                <td>{u.full_name || '—'}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>{u.role === 'admin' ? 'Admin' : 'SV'}</span></td>
                <td style={{ fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => handleEdit(u)}>✏️</button>
                    <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => handleDelete(u)} disabled={u.role === 'admin'}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Chỉnh sửa người dùng: {editUser.user_name}</h2>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              <input className="form-control" value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setEditUser(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={saveEdit}>💾 Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
