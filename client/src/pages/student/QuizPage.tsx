import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { practiceApi } from '../../services/api';
import { Question } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export default function QuizPage() {
  // Lấy sessionId từ URL
  const {sessionId} = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string | null>>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [mode, setMode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const submitted = useRef(false);

  // --- 1. GỌI API LẤY ĐỀ THI & KHÔI PHỤC ĐÁP ÁN NHÁP ---
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const cachedConfig = localStorage.getItem(`session_${sessionId}`);
        if (!cachedConfig) {
          navigate('/');
          return;
        }
        const config = JSON.parse(cachedConfig);

        // 1. Gọi API lấy lại đúng bộ đề đã lưu trong DB cho Session này
        const res = await practiceApi.getQuestions(Number(sessionId));
        setQuestions(res.data.data);

        // 2. Thiết lập cấu hình hiển thị
        setTimeLeft(config.duration);
        setMode(config.mode);
        setSubjectName(config.subject_name || '');

        // 3. Khôi phục lại các câu đã chọn từ LocalStorage (nếu có)
        const savedDraft = localStorage.getItem(`draft_ans_${sessionId}`);
        if (savedDraft) setAnswers(JSON.parse(savedDraft));

        setLoading(false);
      } catch (err) {
        navigate('/');
      }
    };
    fetchQuizData();
  }, [sessionId, navigate]);

  // --- 2. HÀM CHỌN ĐÁP ÁN (Vừa cập nhật UI vừa lưu nháp) ---
  const handleSelectOption = (questionId: number, option: string) => {
    const newAnswers = {...answers, [questionId]: option};
    setAnswers(newAnswers);
    // Lưu nháp để nếu User nhấn F5 thì không bị mất
    localStorage.setItem(`draft_ans_${sessionId}`, JSON.stringify(newAnswers));
  };

  const submit = useCallback(async (auto = false) => {
    if (submitted.current || submitting) return;
    submitted.current = true;
    setSubmitting(true);

    try {
      const payload = questions.map(q => ({
        question_id: q.question_id,
        user_ans: answers[q.question_id] || null
      }));

      await practiceApi.submit(Number(sessionId), payload);

      // Nộp bài xong thì xóa sạch dấu vết LocalStorage
      localStorage.removeItem(`session_${sessionId}`);
      localStorage.removeItem(`draft_ans_${sessionId}`);

      navigate(`/result/${sessionId}`);
    } catch {
      if (auto) navigate(`/result/${sessionId}`);
      else {
        alert('Lỗi nộp bài, vui lòng thử lại');
        submitted.current = false;
        setSubmitting(false);
      }
    }
  }, [questions, answers, sessionId, navigate, submitting]);

  // Bộ đếm ngược thời gian
  useEffect(() => {
    if (timeLeft <= 0 || loading) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          submit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, submit, timeLeft]);

  if (loading) return <div className="loading"> Đang tải bài luyện tập...</div>;

  const q = questions[current];
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');

  const OPTIONS: Array<{ key: string; val: keyof Question }> = [
    {key: 'A', val: 'option_a'}, {key: 'B', val: 'option_b'},
    {key: 'C', val: 'option_c'}, {key: 'D', val: 'option_d'},
  ];

  return (
      <div className="quiz-layout">
        {/* --- PHẦN CHÍNH (BÊN TRÁI) --- */}
        <div className="quiz-main">
          <div className="quiz-header">
            <div>
              <div style={{fontWeight: 700, fontSize: 15}}>{subjectName}</div>
              <div className="quiz-info">
                {mode === 'personalized' ? ' Luyện tập cá nhân hóa' : ' Luyện tập tự do'}
              </div>
            </div>
            <div className="quiz-header-actions">
              <div className="quiz-user-pill">
                <div className="user-avatar">{user?.user_name?.[0]?.toUpperCase()}</div>
                <span className="user-name">{user?.user_name}</span>
              </div>
              <div className={`timer ${timeLeft < 300 ? 'warning' : ''}`}>
                 {mins}:{secs}
              </div>
            </div>
          </div>

          {/* Chỉ giữ lại Badge số câu, ẩn Chapter/Level/Type theo ý bạn */}
          <div className="question-tags">
            <span className="badge badge-blue">Câu {current + 1}/{questions.length}</span>
          </div>

          <div className="question-content">{q.content}</div>

          <div className="options">
            {OPTIONS.map(({key, val}) => {
              const text = q[val] as string;
              if (!text) return null;
              const isSelected = answers[q.question_id] === key;
              return (
                  <button
                      key={key}
                      className={`option-btn${isSelected ? ' selected' : ''}`}
                      // GỌI handleSelectOption ĐỂ CHỐNG F5
                      onClick={() => handleSelectOption(q.question_id, key)}
                  >
                    <span className="option-letter">{key}</span>
                    <span>{text}</span>
                  </button>
              );
            })}
          </div>

          <div className="quiz-nav-buttons">
            <button
                className="btn btn-secondary"
                onClick={() => setCurrent(c => Math.max(0, c - 1))}
                disabled={current === 0}
            >
              ‹ Câu trước
            </button>
            <button
                className="btn btn-danger"
                onClick={() => {
                  if (confirm('Bạn có chắc muốn nộp bài?')) submit(false);
                }}
                disabled={submitting}
            >
              {submitting ? ' Đang nộp...' : ' Nộp bài'}
            </button>
            <button
                className="btn btn-secondary"
                onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
                disabled={current === questions.length - 1}
            >
              Câu sau ›
            </button>
          </div>
        </div>

        {/* --- SIDEBAR ĐIỀU HƯỚNG (BÊN PHẢI) --- */}
        <div className="quiz-sidebar">
          <div style={{fontWeight: 600, fontSize: 14, marginBottom: 14}}>Điều hướng câu hỏi</div>
          <div className="nav-grid">
            {questions.map((_, i) => {
              let cls = 'nav-cell';
              if (i === current) cls += ' current';
              else if (answers[questions[i].question_id]) cls += ' answered';
              return (
                  <button
                      key={i}
                      className={cls}
                      onClick={() => setCurrent(i)}
                  >
                    {i + 1}
                  </button>
              );
            })}
          </div>

          <div className="nav-legend">
            <div className="nav-legend-item">
              <div className="legend-dot" style={{background: 'var(--primary)'}}/>
              Đã trả lời ({Object.keys(answers).length})
            </div>
            <div className="nav-legend-item">
              <div className="legend-dot" style={{background: 'var(--warning)'}}/>
              Đang xem
            </div>
            <div className="nav-legend-item">
              <div className="legend-dot" style={{background: 'var(--gray-200)'}}/>
              Chưa trả lời ({questions.length - Object.keys(answers).length})
            </div>
          </div>
        </div>
      </div>
  );
}
