import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { subjectApi, practiceApi } from '../../services/api';
import { Subject } from '../../types';

const Q_OPTIONS = [30, 40, 50, 60];
const T_OPTIONS = [{ val: 30, label: '30 giây' }, { val: 50, label: '50 giây' }, { val: 60, label: '1 phút' }, { val: 90, label: '1 phút 30 giây' }];

export default function PracticeSettings() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [numQ, setNumQ] = useState(50);
  const [tPerQ, setTPerQ] = useState(60);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'free' | 'personalized'>('free');
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);

  useEffect(() => {
    if (subjectId) subjectApi.getById(Number(subjectId)).then(r => setSubject(r.data.data));
  }, [subjectId]);

  const totalSecs = numQ * tPerQ;
  const totalMins = Math.floor(totalSecs / 60);

  const startFree = async () => {
    setLoading(true);
    try {
      const r = await practiceApi.createFree(Number(subjectId), numQ, tPerQ, selectedChapterId || undefined);
      const { session_id, questions } = r.data.data;
      localStorage.setItem(`session_${session_id}`, JSON.stringify({
        duration: numQ * tPerQ, mode: 'free', subject_name: subject?.subject_name
      }));
      navigate(`/quiz/${session_id}`);
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi tạo bài luyện tập');
    } finally { setLoading(false); }
  };

  const startPersonalized = async () => {
    setLoading(true);
    try {
      const r = await practiceApi.createPersonalized(Number(subjectId));
      const { session_id, questions } = r.data.data;
      localStorage.setItem(`session_${session_id}`, JSON.stringify({
        duration: 3600, mode: 'personalized', subject_name: subject?.subject_name
      }));
      navigate(`/quiz/${session_id}`);
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi tạo bài luyện tập');
    } finally { setLoading(false); }
  };

  return (
    <div className="container-sm">
      <div className="back-btn" onClick={() => navigate('/')}>← Quay lại</div>

      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{ fontSize: 32 }}>📖</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Cài đặt luyện tập</div>
            <div className="text-muted">Môn: {subject?.subject_name} · {subject?.question_count || 0} câu có sẵn</div>
          </div>
        </div>

        {/* Mode selection */}
        <div className="setting-section">
          <div className="setting-label">Chế độ luyện tập</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className={`mode-card${mode === 'free' ? ' selected' : ''}`} style={{ border: mode === 'free' ? '2px solid var(--primary)' : undefined }} onClick={() => setMode('free')}>
              <div className="mode-icon" style={{ background: '#dbeafe', fontSize: 20 }}>⚡</div>
              <div>
                <div className="mode-title" style={{ fontSize: 13 }}>Tự do</div>
                <div className="mode-desc">Tuỳ chỉnh số câu & thời gian</div>
              </div>
            </div>
            <div className={`mode-card${mode === 'personalized' ? ' selected' : ''}`} style={{ border: mode === 'personalized' ? '2px solid var(--secondary)' : undefined }} onClick={() => setMode('personalized')}>
              <div className="mode-icon" style={{ background: '#ede9fe', fontSize: 20 }}>🎯</div>
              <div>
                <div className="mode-title" style={{ fontSize: 13 }}>Cá nhân hóa</div>
                <div className="mode-desc">50 câu / 60 phút tối ưu</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chapter selection (New) */}
        {mode === 'free' && (subject?.chapters?.length || 0) > 0 && (
          <div className="setting-section">
            <div className="setting-label">Chọn chương (Tùy chọn)</div>
            <div className="option-pills">
              <button 
                className={`option-pill${selectedChapterId === null ? ' active' : ''}`} 
                onClick={() => setSelectedChapterId(null)}
              >
                Tất cả
              </button>
              {subject?.chapters?.map((ch) => (
                <button 
                  key={ch.chapter_id} 
                  className={`option-pill${selectedChapterId === ch.chapter_id ? ' active' : ''}`} 
                  onClick={() => setSelectedChapterId(ch.chapter_id)}
                >
                  {ch.chapter_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === 'free' && (
          <>
            <div className="setting-section">
              <div className="setting-label">Số câu hỏi</div>
              <div className="option-pills">
                {Q_OPTIONS.map(q => (
                  <button key={q} className={`option-pill${numQ === q ? ' active' : ''}`} onClick={() => setNumQ(q)}>
                    {q} câu
                  </button>
                ))}
              </div>
            </div>
            <div className="setting-section">
              <div className="setting-label">Thời gian mỗi câu</div>
              <div className="option-pills">
                {T_OPTIONS.map(t => (
                  <button key={t.val} className={`option-pill${tPerQ === t.val ? ' active' : ''}`} onClick={() => setTPerQ(t.val)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="summary-box" style={{ marginBottom: 24 }}>
              <div className="summary-item">
                <div className="summary-key">Tổng số câu</div>
                <div className="summary-val">{numQ}</div>
              </div>
              <div className="summary-item">
                <div className="summary-key">Tổng thời gian</div>
                <div className="summary-val">⏱ {String(totalMins).padStart(2, '0')}:00</div>
              </div>
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={startFree} disabled={loading}>
              {loading ? '⏳ Đang tạo...' : '▶ Bắt đầu luyện tập'}
            </button>
          </>
        )}

        {mode === 'personalized' && (
          <>
            <div style={{ background: 'var(--primary-light)', border: '1px solid #bfdbfe', borderRadius: 'var(--radius)', padding: 16, marginBottom: 20, fontSize: 13, color: 'var(--gray-700)' }}>
              🤖 Hệ thống sẽ tự động phân tích lịch sử học tập của bạn và tạo đề thi cá nhân hóa gồm <strong>50 câu / 60 phút</strong> phù hợp với năng lực của bạn.
            </div>
            <div className="summary-box" style={{ marginBottom: 24 }}>
              <div className="summary-item">
                <div className="summary-key">Số câu</div>
                <div className="summary-val">50</div>
              </div>
              <div className="summary-item">
                <div className="summary-key">Thời gian</div>
                <div className="summary-val">⏱ 60:00</div>
              </div>
            </div>
            <button className="btn btn-full btn-lg" style={{ background: 'var(--secondary)', color: '#fff' }} onClick={startPersonalized} disabled={loading}>
              {loading ? '⏳ Đang tạo...' : '🎯 Bắt đầu luyện tập cá nhân hóa'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
