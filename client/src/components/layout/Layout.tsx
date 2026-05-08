import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const loc = useLocation();
  const isActive = (p: string) => loc.pathname === p ? 'navbar-link active' : 'navbar-link';

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">EQ</div>
          EduQuiz
        </Link>
        <div className="navbar-nav">
          <Link to="/" className={isActive('/')}>🏠 Trang chủ</Link>
          <Link to="/history" className={isActive('/history')}>📋 Lịch sử</Link>
          <Link to="/statistics" className={isActive('/statistics')}>📊 Thống kê</Link>
          {isAdmin && <Link to="/admin" className="navbar-link" style={{ color: '#7c3aed' }}>⚙️ Quản trị</Link>}
        </div>
        <div className="navbar-right">
          <div className="user-pill">
            <div className="user-avatar">{user?.user_name?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{user?.user_name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={logout} style={{ fontSize: 13, padding: '7px 14px' }}>
            Đăng xuất
          </button>
        </div>
      </nav>
      <main className="main-layout">
        <Outlet />
      </main>
    </>
  );
}
