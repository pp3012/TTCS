import { useEffect, useState } from 'react';
import { adminApi, subjectApi } from '../../services/api';

interface SubjectStat {
  subject_id: number;
  subject_name: string;
  total_students: number;
  total_sessions: number;
  avg_score: number;
}

interface UserStat {
  user_id: number;
  user_name: string;
  full_name: string;
  total_sessions: number;
  avg_score: number;
  best_score: number;
}

export default function AdminStatistics() {
  const [subjectStats, setSubjectStats] = useState<SubjectStat[]>([]);
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const [subjects, setSubjects] = useState<{ subject_id: number; subject_name: string }[]>([]);
  const [selectedSubject, setSelectedSubject] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [tab, setTab] = useState<'subjects' | 'users'>('subjects');

  useEffect(() => {
    Promise.all([
      adminApi.getSubjectStats(),
      subjectApi.getAll(),
    ]).then(([statsRes, subjectsRes]) => {
      const stats = statsRes.data.data || [];
      const subs = subjectsRes.data.data || [];
      setSubjectStats(stats);
      setSubjects(subs);
      if (subs.length > 0) setSelectedSubject(subs[0].subject_id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab !== 'users') return;
    setUserLoading(true);
    adminApi.getUserStats({ subject_id: selectedSubject || undefined, limit: 20 })
      .then(r => setUserStats(r.data.data || []))
      .finally(() => setUserLoading(false));
  }, [tab, selectedSubject]);

  const totalStudents = subjectStats.reduce((s, st) => s + (st.total_students || 0), 0);
  const totalSessions = subjectStats.reduce((s, st) => s + (st.total_sessions || 0), 0);
  const avgScore = subjectStats.length > 0
    ? (subjectStats.reduce((s, st) => s + (Number(st.avg_score) || 0), 0) / subjectStats.length).toFixed(1)
    : '—';



  const scoreColor = (score: number) => {
    if (score >= 8) return 'var(--success)';
    if (score >= 5) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Thống kê hệ thống</h1>
        <p className="page-subtitle">Báo cáo hoạt động luyện tập và hiệu suất của sinh viên</p>
      </div>

      {/* Summary cards */}
      <div className="overview-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 32 }}>
        <div className="overview-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="overview-val">{subjectStats.length}</div>
          <div className="overview-label">Môn học</div>
        </div>
        <div className="overview-card" style={{ borderLeft: '4px solid var(--secondary)' }}>
          <div className="overview-val" style={{ color: 'var(--secondary)' }}>{totalStudents}</div>
          <div className="overview-label"> Sinh viên tham gia</div>
        </div>
        <div className="overview-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="overview-val" style={{ color: 'var(--success)' }}>{totalSessions}</div>
          <div className="overview-label"> Tổng lượt luyện tập</div>
        </div>
        <div className="overview-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="overview-val" style={{ color: 'var(--warning)' }}>{avgScore}</div>
          <div className="overview-label"> Điểm TB toàn hệ thống</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: 'var(--gray-100)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {(['subjects', 'users'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all .2s',
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? 'var(--primary)' : 'var(--gray-500)',
              boxShadow: tab === t ? 'var(--shadow)' : 'none',
            }}
          >
            {t === 'subjects' ? '📚 Theo môn học' : '👤 Theo sinh viên'}
          </button>
        ))}
      </div>

      {/* Subjects tab */}
      {tab === 'subjects' && (
        loading ? <div className="loading"> Đang tải...</div> : (
          <div>


            <table className="admin-table">
              <thead>
                <tr>
                  <th>Môn học</th>
                  <th>SV tham gia</th>
                  <th>Tổng lượt</th>
                  <th>Điểm TB</th>
                </tr>
              </thead>
              <tbody>
                {subjectStats.map(s => {
                  const avg = s.avg_score ? Number(s.avg_score) : 0;
                  return (
                    <tr key={s.subject_id}>
                      <td style={{ fontWeight: 600 }}>{s.subject_name}</td>
                      <td>{s.total_students || 0}</td>
                      <td>{s.total_sessions || 0}</td>
                      <td style={{ fontWeight: 700, color: scoreColor(avg) }}>
                        {avg ? avg.toFixed(1) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div>
          <div className="filter-bar">
            <select className="filter-select" value={selectedSubject} onChange={e => setSelectedSubject(Number(e.target.value))}>
              <option value={0}>Tất cả môn học</option>
              {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
            </select>
            <span className="text-muted">Top 20 sinh viên theo số lượt luyện tập</span>
          </div>
          {userLoading ? <div className="loading"> Đang tải...</div> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sinh viên</th>
                  <th>Tổng lượt luyện tập</th>
                  <th>Điểm TB</th>
                  <th>Điểm cao nhất</th>
                </tr>
              </thead>
              <tbody>
                {userStats.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 32 }}>Chưa có dữ liệu</td></tr>
                ) : userStats.map((u, idx) => {
                  const avg = u.avg_score ? Number(u.avg_score) : 0;
                  return (
                    <tr key={u.user_id}>
                      <td style={{ fontWeight: 700, color: idx < 3 ? ['#f59e0b','#94a3b8','#d97706'][idx] : 'var(--gray-500)' }}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{u.user_name}</div>
                        {u.full_name && <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{u.full_name}</div>}
                      </td>
                      <td>{u.total_sessions || 0}</td>
                      <td style={{ fontWeight: 700, color: scoreColor(avg) }}>{avg ? avg.toFixed(1) : '—'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{u.best_score ? Number(u.best_score).toFixed(1) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
