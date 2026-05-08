import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const isActive = (p: string) => loc.pathname === p || (p !== '/admin' && loc.pathname.startsWith(p)) ? 'navbar-link active' : 'navbar-link';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <nav className="navbar" style={{ justifyContent: 'space-between' }}>
        <Link to="/admin" className="navbar-brand">
          <div className="navbar-logo">EQ</div>
          EduQuiz <span style={{ fontSize: '12px', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', marginLeft: '4px', fontWeight: 600 }}>Admin</span>
        </Link>
        <div className="navbar-nav" style={{ marginLeft: 0 }}>
          <Link to="/admin" className={loc.pathname === '/admin' ? 'navbar-link active' : 'navbar-link'}>
            <span style={{ marginRight: '6px' }}>⌘</span>Trang chủ
          </Link>
          <Link to="/admin/subjects" className={isActive('/admin/subjects')}>
            <span style={{ marginRight: '6px' }}>📚</span>Môn học
          </Link>
          <Link to="/admin/questions" className={isActive('/admin/questions')}>
            <span style={{ marginRight: '6px' }}>❓</span>Câu hỏi
          </Link>
          <Link to="/admin/users" className={isActive('/admin/users')}>
            <span style={{ marginRight: '6px' }}>👥</span>Người dùng
          </Link>
          <Link to="/admin/statistics" className={isActive('/admin/statistics')}>
            <span style={{ marginRight: '6px' }}>📊</span>Thống kê
          </Link>
        </div>
        <div className="navbar-right">
          <div className="user-pill" style={{ background: 'transparent' }}>
            <span style={{ fontSize: '16px', marginRight: '12px', cursor: 'pointer' }}>🌙</span>
            <div className="user-info">
              <span className="user-name">{user?.user_name || 'admin'}</span>
            </div>
          </div>
          <button onClick={logout} style={{ background: 'transparent', border: 'none', fontSize: 13, color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>[→</span> Đăng xuất
          </button>
        </div>
      </nav>
      <main className="container" style={{ maxWidth: '1200px' }}>
        <Outlet />
      </main>
    </div>
  );
}
