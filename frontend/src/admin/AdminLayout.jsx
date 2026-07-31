import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AdminLayout.css';

const NAV = [
  { to: '/admin-panel', label: 'Dashboard', end: true },
  { to: '/admin-panel/products', label: 'Products' },
  { to: '/admin-panel/categories', label: 'Categories' },
  { to: '/admin-panel/pharmacies', label: 'Pharmacies' },
  { to: '/admin-panel/homepage', label: 'Manage Homepage' },
  { to: '/admin-panel/about', label: 'Manage About Us' },
  { to: '/admin-panel/contact-info', label: 'Manage Contact Info' },
  { to: '/admin-panel/order-requests', label: 'Order Requests' },
  { to: '/admin-panel/messages', label: 'Messages' },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin-panel/login', { replace: true });
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">BLACK NADYA</div>
        <span className="admin-sidebar__subtitle">Admin Panel</span>
        <nav className="admin-sidebar__nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-sidebar__link${isActive ? ' admin-sidebar__link--active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="btn btn--outline admin-sidebar__logout" onClick={handleLogout}>
          Log Out
        </button>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
