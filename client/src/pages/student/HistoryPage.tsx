import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { practiceApi, subjectApi } from '../../services/api';
import { PracticeSession, Subject } from '../../types';

function formatTime(secs: number) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function formatDate(dt: string | null) {
  if (!dt) return '-';
  const d = new Date(dt);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} ${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const LIMIT = 10;

  useEffect(() => { subjectApi.getAll().then(r => setSubjects(r.data.data || [])); }, []);

  useEffect(() => {
    setLoading(true);
    practiceApi.getHistory({ page, limit: LIMIT, subject_id: subjectFilter || undefined })
      .then(r => { setSessions(r.data.data || []); setTotal(r.data.total || 0); })
      .finally(() => setLoading(false));
  }, [page, subjectFilter]);

  const totalPages = Math.ceil(total / LIMIT);

  const scoreColor = (s: number | null) => {
    if (s === null) return '';
    if (s >= 8) return 'score-high';
    if (s >= 5) return 'score-mid';
    return 'score-low';
  };

  return (
    <div className="container">
      <h1 className="page-title">Lịch sử luyện tập</h1>

      <div className="filter-bar">
        <select className="filter-select" value={subjectFilter} onChange={e => { setSubjectFilter(e.target.value); setPage(1); }}>
          <option value="">Tất cả môn</option>
          {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
        </select>
        <span className="text-muted">{total} bài</span>
      </div>

      {loading ? (
        <div className="loading"> Đang tải...</div>
      ) : sessions.length === 0 ? (
        <div className="empty">Chưa có lịch sử luyện tập</div>
      ) : (
        <>
          <table className="history-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Môn học</th>
                <th>Chế độ</th>
                <th>Số câu</th>
                <th>Điểm</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => {
                const durSecs = s.submit_time && s.start_time
                  ? Math.floor((new Date(s.submit_time).getTime() - new Date(s.start_time).getTime()) / 1000)
                  : 0;
                return (
                  <tr key={s.session_id} onClick={() => navigate(`/result/${s.session_id}`)}>
                    <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{formatDate(s.start_time)}</td>
                    <td style={{ fontWeight: 500 }}>{s.subject_name}</td>
                    <td>
                      <span className={`badge ${s.mode === 'personalized' ? 'badge-purple' : 'badge-blue'}`}>
                        {s.mode === 'personalized' ? 'Cá nhân hóa' : 'Tự do'}
                      </span>
                    </td>
                    <td>{s.total_questions}</td>
                    <td className={`score-cell ${scoreColor(s.score)}`}>
                      {s.score !== null ? Number(s.score).toFixed(1) : '-'}
                    </td>
                    <td>{durSecs > 0 ? formatTime(durSecs) : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <span className="text-muted" style={{ marginRight: 8 }}>Trang {page}/{totalPages}</span>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
