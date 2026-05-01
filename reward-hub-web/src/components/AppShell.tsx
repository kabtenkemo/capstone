import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const managementRoles = new Set(['Admin', 'Teacher']);

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/points', label: 'Points', managementOnly: true },
  { to: '/comments', label: 'Comments', managementOnly: true },
  { to: '/profile', label: 'Profile' }
];

export function AppShell() {
  const { profile, role, childProfile, logout } = useAuth();
  const displayProfile = role === 'Parent' && childProfile ? childProfile : profile;
  const canSeeManagementRoutes = managementRoles.has(role ?? '');
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand-row">
            <img src="/logo.png" alt="Reward Hub Logo" className="brand-logo" />
            <div className="brand-copy">
              <h1>Reward Hub</h1>
              <p>Reward tracking portal</p>
            </div>
          </div>
        </div>

        <nav className="nav-links">
          {navItems
            .filter((item) => canSeeManagementRoutes || !item.managementOnly)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            ))}
        </nav>

        <button type="button" className="ghost-button sidebar-logout" onClick={logout}>
          Logout
        </button>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div>
            <h2>{displayProfile?.username ?? 'Reward Hub'}</h2>
          </div>

          <div className="topbar-badges">
            <span className="badge">{role ?? 'Unknown role'}</span>
            <span className="badge subtle">{displayProfile?.className ?? 'No class assigned'}</span>
            {displayProfile ? <span className="badge subtle">Points {displayProfile.points}</span> : null}
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
