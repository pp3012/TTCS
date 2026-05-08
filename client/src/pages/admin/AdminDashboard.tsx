import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';

interface SubjectStat {
  subject_id: number; subject_name: string;
  total_students: number; total_sessions: number; avg_score: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SubjectStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getSubjectStats().then(r => setStats(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const totalStudents = stats.reduce((s, st) => s + (st.total_students || 0), 0);
  const totalSessions = stats.reduce((s, st) => s + (st.total_sessions || 0), 0);

  return (
    <div>
      <h1 className="page-title">Tổng quan hệ thống</h1>
      <p className="page-subtitle">Thống kê hoạt động luyện tập trên toàn hệ thống.</p>

      <div className="overview-cards">
        <div className="overview-card">
          <div className="overview-val">{stats.length}</div>
          <div className="overview-label">Môn học</div>
        </div>
        <div className="overview-card">
          <div className="overview-val" style={{ color: 'var(--secondary)' }}>{totalStudents}</div>
          <div className="overview-label">Sinh viên tham gia</div>
        </div>
        <div className="overview-card">
          <div className="overview-val" style={{ color: 'var(--success)' }}>{totalSessions}</div>
          <div className="overview-label">Tổng lượt luyện tập</div>
        </div>
      </div>

      {loading ? <div className="loading">⏳ Đang tải...</div> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Môn học</th>
              <th>Số SV tham gia</th>
              <th>Tổng lượt luyện tập</th>
              <th>Điểm trung bình</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(s => (
              <tr key={s.subject_id}>
                <td style={{ fontWeight: 500 }}>{s.subject_name}</td>
                <td>{s.total_students || 0}</td>
                <td>{s.total_sessions || 0}</td>
                <td style={{ fontWeight: 600 }}>{s.avg_score ? Number(s.avg_score).toFixed(1) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
