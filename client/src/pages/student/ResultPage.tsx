import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { practiceApi } from '../../services/api';
import { SessionResult } from '../../types';

export default function ResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<SessionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'wrong'>('all');

  useEffect(() => {
    practiceApi.getResult(Number(sessionId))
      .then(r => setResult(r.data.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [sessionId, navigate]);

  if (loading) return <div className="loading">⏳ Đang tải kết quả...</div>;
  if (!result) return null;

  const totalQuestions = result.total_questions;
  const correctCount = result.correct_count;
  const wrongCount = totalQuestions - correctCount;
  const score = Number(result.score).toFixed(1);
  const durMins = Math.floor(result.duration_actual / 60);

  const filteredDetails = filter === 'all' 
    ? result.details 
    : result.details.filter(d => !d.is_correct);

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      {/* Score summary card */}
      <div className="result-summary-card">
        <div className="score-box">
          <p className="score-label">Điểm số</p>
          <div className="score-value-wrapper">
            <span className="score-big">{score}</span>
            <span className="score-denom">/10</span>
          </div>
        </div>

        <div className="stat-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' ,alignItems: 'center'}}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="stat-box">
              <p className="stat-label">Môn học</p>
              <p className="stat-val" style={{ fontSize: 14 }}>{result.subject_name}</p>
            </div>
            <div className="stat-box">
              <p className="stat-label">Thời gian làm bài</p>
              <p className="stat-val">{durMins}:00</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="stat-box">
              <p className="stat-label success">✔ Đúng</p>
              <p className="stat-val success">{correctCount}/{totalQuestions}</p>
            </div>
            <div className="stat-box">
              <p className="stat-label danger">✖ Sai</p>
              <p className="stat-val danger">{wrongCount}/{totalQuestions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
            onClick={() => navigate('/history')}
            className="btn btn-primary" style={{ padding: '12px 24px' }}
        >
          Quay về
        </button>
        <button 
          onClick={() => navigate(`/practice/${result.subject_id}`)}
          className="btn btn-outline-gray" style={{ padding: '12px 24px' }}
        >
           Tiếp tục luyện tập môn này
        </button>
      </div>

      {/* Detailed Breakdown */}
      <div className="detail-section-card">
        <div className="detail-section-header">
          <h2 className="section-title" style={{ fontSize: 18, fontWeight: 800 }}>Chi tiết bài làm</h2>
          
          <div className="filter-toggle">
            <button 
              onClick={() => setFilter('all')}
              className={`filter-btn ${filter === 'all' ? 'active all' : ''}`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setFilter('wrong')}
              className={`filter-btn ${filter === 'wrong' ? 'active wrong' : ''}`}
            >
              Câu sai
            </button>
          </div>
        </div>

        <div className="questions-list">
          {filteredDetails.map((d, index) => (
            <div key={d.question_id} className="question-item">
              <div className="question-header">
                <span className={`question-status-icon ${d.is_correct ? 'success' : 'danger'}`}>
                  {d.is_correct ? '✔' : '✖'}
                </span>
                <div>
                  <p className={`question-number ${d.is_correct ? 'success' : 'danger'}`}>
                    Câu {index + 1}
                  </p>
                  <h3 className="question-content">{d.content}</h3>
                </div>
              </div>

              <div className="options-container">
                {['A', 'B', 'C', 'D'].map((optChar) => {
                  const field = `option_${optChar.toLowerCase()}` as keyof typeof d;
                  const optText = d[field] as string;
                  if (!optText) return null;

                  const isUserAns = d.user_ans?.toUpperCase() === optChar.toUpperCase();
                  const isCorrectAns = d.correct_option?.toUpperCase() === optChar.toUpperCase();
                  
                  let cls = '';
                  let statusLabel = null;

                  if (isCorrectAns) {
                    cls = 'correct-ans';
                    statusLabel = <span className="opt-status-label" style={{ color: '#16a34a' }}>✔ Đúng</span>;
                  } else if (isUserAns) {
                    cls = 'wrong-ans';
                    statusLabel = <span className="opt-status-label" style={{ color: '#dc2626' }}>✖ Bạn chọn</span>;
                  }

                  return (
                    <div key={optChar} className={`answer-row ${cls}`}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="opt-label">{optChar.toLowerCase()}.</span>
                        <span className="opt-text">{optText}</span>
                      </div>
                      {statusLabel}
                    </div>
                  );
                })}
              </div>

              {d.explanation && (
                <div className="explanation-box">
                  <span className="explanation-icon">💡</span>
                  <div>
                    <p className="explanation-title">Giải thích</p>
                    <p className="explanation-text">{d.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
