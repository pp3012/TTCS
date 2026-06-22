import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subjectApi } from '../../services/api';
import { Subject } from '../../types';

const SUBJECT_COLORS = ['#e0f2fb'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subjectApi.getAll().then(r => setSubjects(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const filteredSubjects = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return subjects;

    return subjects.filter(subject => {
      const name = subject.subject_name.toLowerCase();
      const description = subject.description?.toLowerCase() || '';
      return name.includes(keyword) || description.includes(keyword);
    });
  }, [subjects, searchTerm]);

  return (
    <div className="container">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Xin chào, {user?.user_name}! 👋</h1>
        <p className="page-subtitle">Chọn môn học và bắt đầu luyện tập ngay hôm nay.</p>
      </div>

      <div className="section-header">
        <span className="section-title">Chọn môn học</span>
      </div>

      <div className="subject-search">
        <input
          className="form-control"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm môn học..."
        />
      </div>

      {loading ? (
        <div className="loading"> Đang tải...</div>
      ) : filteredSubjects.length === 0 ? (
        <div className="empty-state">Không tìm thấy môn học phù hợp.</div>
      ) : (
        <div className="subject-grid">
          {filteredSubjects.map((s, i) => (
            <div
              key={s.subject_id}
              className="subject-card card-hover"
              style={{ background: SUBJECT_COLORS[0] }}
              onClick={() => navigate(`/practice/${s.subject_id}`)}
            >

              <div className="subject-name">{s.subject_name}</div>
              {s.description && <div className="subject-desc">{s.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
