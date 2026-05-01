import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { useAuth } from './context/AuthContext';
import { DashboardPage } from './pages/DashboardPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { LoginPage } from './pages/LoginPage';
import { CommentsPage } from './pages/CommentsPage';
import { PointsPage } from './pages/PointsPage';
import { ProfilePage } from './pages/ProfilePage';

function isManagementRole(role: string | null) {
  return role === 'Admin' || role === 'Teacher';
}

function getDefaultRoute(role: string | null) {
  if (role === 'Parent') {
    return '/profile';
  }

  return '/';
}

function ProtectedRoute() {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="page-loading">Loading Reward Hub...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function ManagementRoute() {
  const { role, loading } = useAuth();

  if (loading) {
    return <div className="page-loading">Loading Reward Hub...</div>;
  }

  if (!isManagementRole(role)) {
    return <Navigate to={getDefaultRoute(role)} replace />;
  }

  return <Outlet />;
}

function GuestRoute() {
  const { token, role, loading } = useAuth();

  if (loading) {
    return <div className="page-loading">Loading Reward Hub...</div>;
  }

  if (token) {
    return <Navigate to={getDefaultRoute(role)} replace />;
  }

  return <Outlet />;
}

function RootRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, role, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (token) {
      navigate(getDefaultRoute(role), { replace: true, state: { from: location.pathname } });
    } else {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [loading, location.pathname, navigate, role, token]);

  return <div className="page-loading">Redirecting...</div>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route element={<ManagementRoute />}>
            <Route path="/points" element={<PointsPage />} />
            <Route path="/comments" element={<CommentsPage />} />
          </Route>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
