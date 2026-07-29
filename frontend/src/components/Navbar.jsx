import { NavLink } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import './Navbar.css';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/where-to-buy', label: 'Where to Buy' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { settings } = useSiteSettings();

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand">
          {settings?.logo_image ? (
            <img src={settings.logo_image} alt="Black Nadya" className="navbar__logo" />
          ) : (
            <span className="navbar__brand-text">BLACK NADYA</span>
          )}
        </NavLink>
        <nav className="navbar__links">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
