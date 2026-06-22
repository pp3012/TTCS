import { useEffect, useState } from 'react';
import { adminApi, subjectApi, questionApi } from '../../services/api';
import { Link } from 'react-router-dom';

interface SubjectStat {
  subject_id: number; subject_name: string;
  total_students: number; total_sessions: number; avg_score: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SubjectStat[]>([]);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getSubjectStats(),
      adminApi.getUsers({ page: 1, limit: 1 }),
      subjectApi.getAll(),
    ]).then(async ([statsRes, usersRes, subjectsRes]) => {
      const fetchedStats: SubjectStat[] = statsRes.data.data || [];
      setStats(fetchedStats);
      setTotalUsers(usersRes.data.total || 0);

      // Sum questions across all subjects
      const subjects = subjectsRes.data.data || [];
      let qTotal = 0;
      for (const s of subjects) {
        try {
          const qr = await questionApi.getBySubject(s.subject_id, { page: 1, limit: 1 });
          qTotal += qr.data.total || 0;
        } catch { /* ignore */ }
      }
      setTotalQuestions(qTotal);
    }).finally(() => setLoading(false));
  }, []);

  const totalSessions = stats.reduce((s, st) => s + (st.total_sessions || 0), 0);
  const totalStudents = stats.reduce((s, st) => s + (st.total_students || 0), 0);

  const quickLinks = [
    { to: '/admin/subjects',  label: 'Quản lý môn học', desc: 'Thêm, sửa, xoá môn học', color: '#2563eb' },
    { to: '/admin/questions',  label: 'Quản lý câu hỏi', desc: 'Thêm, sửa, xoá câu hỏi', color: '#7c3aed' },
    { to: '/admin/users',  label: 'Quản lý người dùng', desc: 'Thêm, sửa, xoá tài khoản', color: '#0891b2' },
    { to: '/admin/statistics',  label: 'Thống kê', desc: 'Báo cáo hoạt động hệ thống', color: '#16a34a' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Tổng quan hệ thống</h1>
        <p className="page-subtitle">Chào mừng Admin trở lại! Đây là tổng quan hoạt động của EduQuiz.</p>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Môn học', value: stats.length, color: '#2563eb' },
          { label: 'Người dùng', value: totalUsers, color: '#7c3aed'},
          { label: 'Câu hỏi', value: totalQuestions,  color: '#0891b2' },
          { label: 'Lượt luyện tập', value: totalSessions, color: '#16a34a'},
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: '20px 22px', borderLeft: `4px solid ${c.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 500 }}>{c.label}</span>
              <div style={{ width: 36, height: 36, borderRadius: 10,  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: c.color, lineHeight: 1 }}>
              {loading || c.value === null ? <span style={{ fontSize: 14, color: 'var(--gray-400)' }}>...</span> : c.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        {/* Quick navigation */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-800)', marginBottom: 16 }}> Truy cập nhanh</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {quickLinks.map(lnk => (
              <Link key={lnk.to} to={lnk.to} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                borderRadius: 10, border: '1.5px solid var(--gray-100)',
                background: lnk.color + '15', textDecoration: 'none', transition: 'all .15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = lnk.color; (e.currentTarget as HTMLElement).style.background = lnk.color + '15'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gray-100)'; (e.currentTarget as HTMLElement).style.background = lnk.color + '15'; }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-800)' }}>{lnk.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{lnk.desc}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: 'var(--gray-400)', fontSize: 16 }}>→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Top subjects */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-800)', marginBottom: 16 }}> Hoạt động theo môn</div>
          {loading ? <div className="loading" style={{ padding: 20 }}> Đang tải...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.slice(0, 5).map(s => {
                const avg = s.avg_score ? Number(s.avg_score) : 0;
                return (
                  <div key={s.subject_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.subject_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{s.total_sessions || 0} lượt · {s.total_students || 0} SV</div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: avg >= 8 ? 'var(--success)' : avg >= 5 ? 'var(--warning)' : avg > 0 ? 'var(--danger)' : 'var(--gray-400)' }}>
                      {avg ? avg.toFixed(1) : '—'}
                    </span>
                  </div>
                );
              })}
              {stats.length === 0 && <div style={{ color: 'var(--gray-400)', fontSize: 13, textAlign: 'center', padding: 16 }}>Chưa có dữ liệu</div>}
            </div>
          )}
        </div>
      </div>

      {/* Full subject table */}
      {!loading && stats.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-800)', marginBottom: 14 }}> Chi tiết theo môn học</div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Môn học</th>
                <th>SV tham gia</th>
                <th>Tổng lượt luyện tập</th>
                <th>Điểm trung bình</th>
                <th>Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {stats.map(s => {
                const avg = s.avg_score ? Number(s.avg_score) : 0;
                return (
                  <tr key={s.subject_id}>
                    <td style={{ fontWeight: 500 }}>{s.subject_name}</td>
                    <td>{s.total_students || 0}</td>
                    <td>{s.total_sessions || 0}</td>
                    <td style={{ fontWeight: 700, color: avg >= 8 ? 'var(--success)' : avg >= 5 ? 'var(--warning)' : avg > 0 ? 'var(--danger)' : 'var(--gray-400)' }}>
                      {avg ? avg.toFixed(1) : '—'}
                    </td>
                    <td>
                      <span className={`badge ${avg >= 8 ? 'badge-green' : avg >= 5 ? 'badge-orange' : avg > 0 ? 'badge-red' : 'badge-gray'}`}>
                        {avg >= 8 ? 'Xuất sắc' : avg >= 5 ? 'Trung bình' : avg > 0 ? 'Yếu' : 'Chưa có dữ liệu'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
