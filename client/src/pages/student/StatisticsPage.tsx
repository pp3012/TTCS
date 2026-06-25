import { useEffect, useState } from 'react';
import { subjectApi, practiceApi } from '../../services/api';
import { Subject, UserStats } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

export default function StatisticsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [chapters, setChapters] = useState<{ chapter_id: number; chapter_name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    subjectApi.getAll().then(r => {
      const s = r.data.data || [];
      setSubjects(s);
      if (s.length > 0) setSelectedSubject(s[0].subject_id);
    });
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;
    let active = true; // Cờ hiệu ngăn lỗi Race Condition khi chuyển môn nhanh
    setLoading(true);

    Promise.all([
      practiceApi.getStats(selectedSubject),
      subjectApi.getById(selectedSubject),
    ]).then(([sr, cr]) => {
      if (!active) return;
      setStats(sr.data.data);
      setChapters(cr.data.data?.chapters || []);
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [selectedSubject]);

  const chapterData = stats ? Object.entries(stats.chapter_accuracy || {}).map(([id, acc]) => {
    const ch = chapters.find(c => c.chapter_id === Number(id));
    return { name: ch?.chapter_name || `Ch. ${id}`, accuracy: Math.round(acc * 100) };
  }) : [];

  const diffNames: Record<string, string> = { '1': 'Dễ', '2': 'Trung bình', '3': 'Khó' };
  const diffData = stats ? Object.entries(stats.difficulty_accuracy || {}).map(([id, acc]) => ({
    name: diffNames[id] || id, accuracy: Math.round(acc * 100),
  })) : [];

  const typeNames: Record<string, string> = { '1': 'Lý thuyết', '2': 'Bài tập' };
  const typeData = stats ? Object.entries(stats.type_accuracy || {}).map(([id, acc]) => ({
    name: typeNames[id] || id, accuracy: Math.round(acc * 100),
  })) : [];

  // SỬA LỖI: Sắp xếp chuỗi điểm số từ cũ nhất đến mới nhất để đồ thị hiển thị đúng tiến trình
  const scoreHistory = stats?.score_history
      ? [...stats.score_history]
          .sort((a, b) => new Date(a.submit_time).getTime() - new Date(b.submit_time).getTime())
          .map(s => ({
            time: new Date(s.submit_time).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' }),
            score: s.score,
          }))
      : [];

  return (
      <div className="container">
        <h1 className="page-title">Thống kê & Phân tích cá nhân</h1>
        <p className="page-subtitle">Xem điểm mạnh, điểm yếu và tiến bộ của bạn theo từng môn.</p>

        <div className="filter-bar">
          <select className="filter-select" value={selectedSubject || ''} onChange={e => setSelectedSubject(Number(e.target.value))}>
            {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
          </select>
        </div>

        {loading ? <div className="loading"> Đang tải...</div> : !stats ? (
            <div className="empty">Chưa có dữ liệu thống kê</div>
        ) : (
            <>
              <div className="overview-cards">
                <div className="overview-card">
                  <div className="overview-val">{stats.total_sessions}</div>
                  <div className="overview-label">Tổng số lần luyện tập</div>
                </div>
                <div className="overview-card">
                  <div className="overview-val" style={{ color: 'var(--success)' }}>{Number(stats.overall_score).toFixed(1)}</div>
                  <div className="overview-label">Điểm trung bình</div>
                </div>
              </div>

              <div className="stats-grid">
                <div className="chart-card">
                  <div className="chart-title"> Tỷ lệ chính xác theo chương</div>
                  {chapterData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={chapterData}><XAxis dataKey="name" fontSize={11} /><YAxis domain={[0,100]} fontSize={11} /><Tooltip formatter={(v: number) => `${v}%`} /><Bar dataKey="accuracy" fill="#2563eb" radius={[4,4,0,0]} /></BarChart>
                      </ResponsiveContainer>
                  ) : <div className="text-muted" style={{ padding: 32, textAlign: 'center' }}>Chưa có dữ liệu</div>}
                </div>

                <div className="chart-card">
                  <div className="chart-title"> Tiến bộ điểm số theo thời gian</div>
                  {scoreHistory.length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={scoreHistory}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="time" fontSize={11} /><YAxis domain={[0,10]} fontSize={11} /><Tooltip /><Legend /><Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} name="Điểm" dot={{ r: 4 }} /></LineChart>
                      </ResponsiveContainer>
                  ) : <div className="text-muted" style={{ padding: 32, textAlign: 'center' }}>Chưa có dữ liệu</div>}
                </div>

                <div className="chart-card">
                  <div className="chart-title"> Tỷ lệ chính xác theo độ khó</div>
                  {diffData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        {/* SỬA LỖI: Tăng width trục Y lên 95 để không bị khuất chữ "Trung bình" */}
                        <BarChart data={diffData} layout="vertical"><XAxis type="number" domain={[0,100]} fontSize={11} /><YAxis type="category" dataKey="name" fontSize={12} width={95} /><Tooltip formatter={(v: number) => `${v}%`} /><Bar dataKey="accuracy" fill="#7c3aed" radius={[0,4,4,0]} /></BarChart>
                      </ResponsiveContainer>
                  ) : <div className="text-muted" style={{ padding: 32, textAlign: 'center' }}>Chưa có dữ liệu</div>}
                </div>

                <div className="chart-card">
                  <div className="chart-title"> Tỷ lệ chính xác theo loại câu hỏi</div>
                  {typeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        {/* SỬA LỖI: Tăng width trục Y lên 95 để hiển thị trọn vẹn chữ "Lý thuyết", "Bài tập" */}
                        <BarChart data={typeData} layout="vertical"><XAxis type="number" domain={[0,100]} fontSize={11} /><YAxis type="category" dataKey="name" fontSize={12} width={95} /><Tooltip formatter={(v: number) => `${v}%`} /><Bar dataKey="accuracy" fill="#16a34a" radius={[0,4,4,0]} /></BarChart>
                      </ResponsiveContainer>
                  ) : <div className="text-muted" style={{ padding: 32, textAlign: 'center' }}>Chưa có dữ liệu</div>}
                </div>
              </div>
            </>
        )}
      </div>
  );
}