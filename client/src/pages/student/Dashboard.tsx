import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subjectApi } from '../../services/api';
import { Subject } from '../../types';

const SUBJECT_COLORS = ['#dbeafe','#dcfce7','#fce7f3','#ffedd5','#ede9fe','#cffafe'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subjectApi.getAll().then(r => setSubjects(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Xin chào, {user?.user_name}! 👋</h1>
        <p className="page-subtitle">Chọn môn học và bắt đầu luyện tập ngay hôm nay.</p>
      </div>

      <div className="section-header">
        <span className="section-title">Chọn môn học</span>
      </div>

      {loading ? (
        <div className="loading"> Đang tải...</div>
      ) : (
        <div className="subject-grid">
          {subjects.map((s, i) => (
            <div
              key={s.subject_id}
              className="subject-card card-hover"
              onClick={() => navigate(`/practice/${s.subject_id}`)}
            >

              <div className="subject-name">{s.subject_name}</div>
              {s.description && <div className="subject-desc">{s.description}</div>}
            </div>
          ))}
        </div>
      )}
        {/*
      <div className="divider" />
      <div className="section-header">
        <span className="section-title">Chế độ luyện tập</span>
        <span className="text-muted">Vui lòng chọn môn học trước để bắt đầu.</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="mode-card" style={{ opacity: 0.6, cursor: 'default' }}>
          <div>
            <div className="mode-title">Luyện tập tự do</div>
            <div className="mode-desc">Tự chọn số câu và thời gian theo ý muốn</div>
          </div>
          <span className="mode-arrow">›</span>
        </div>
        <div className="mode-card" style={{ opacity: 0.6, cursor: 'default' }}>
          <div>
            <div className="mode-title">Luyện tập cá nhân hóa</div>
            <div className="mode-desc">Tự động sinh 50 câu, 60 phút — tối ưu cho bạn</div>
          </div>
          <span className="mode-arrow">›</span>
        </div>
      </div>
      */}
    </div>
  );
}
