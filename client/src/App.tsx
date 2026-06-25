import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import Layout from './pages/student/Layout';
import Dashboard from './pages/student/Dashboard';
import PracticeSettings from './pages/student/PracticeSettings';
import QuizPage from './pages/student/QuizPage';
import ResultPage from './pages/student/ResultPage';
import HistoryPage from './pages/student/HistoryPage';
import StatisticsPage from './pages/student/StatisticsPage';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminStatistics from './pages/admin/AdminStatistics';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin } = useAuth();
    //ko f user (chưa đăng nhập)-> gọi login
  if (!user) return <Navigate to="/login" replace />;
   //là admin-> gọi page admin
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  //đã đăng nhập nma ko f admin
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

/*
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin } = useAuth();
  if (user) {
    return isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
 */

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isAdmin } = useAuth();
    if (user) {
        if (isAdmin) {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }
    return <>{children}</>;
};


function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute> <Login /> </PublicRoute>} />
      <Route path="/register" element={<PublicRoute> <Register /> </PublicRoute>} />

      <Route element={<PrivateRoute> <Layout /> </PrivateRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/practice/:subjectId" element={<PracticeSettings />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />

      </Route>

      <Route path="/quiz/:sessionId" element={<PrivateRoute><QuizPage /></PrivateRoute>} />
      <Route path="/result/:sessionId" element={<PrivateRoute><ResultPage /></PrivateRoute>} />

      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="subjects" element={<AdminSubjects />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="statistics" element={<AdminStatistics />} />
      </Route>

        {/* Dấu '*' là bất kỳ URL nào không khớp với tất cả các cấu hình ở trên.
         Nếu user gõ bậy bạ một URL, hệ thống sẽ tự động dùng <Navigate /> để đá họ về trang chủ '/'
         */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
