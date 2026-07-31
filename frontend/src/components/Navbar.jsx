import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useCart } from '../hooks/useCart';
import LanguageSwitcher from './LanguageSwitcher';
import CartDrawer from './CartDrawer';
import './Navbar.css';

const LINKS = [
  { to: '/', key: 'home' },
  { to: '/products', key: 'products' },
  { to: '/where-to-buy', key: 'whereToBuy' },
  { to: '/about', key: 'about' },
  { to: '/contact', key: 'contact' },
];

export default function Navbar() {
  const { settings } = useSiteSettings();
  const { t } = useTranslation();
  const cart = useCart();
  const [cartOpen, setCartOpen] = useState(false);

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
              {t(`nav.${link.key}`)}
            </NavLink>
          ))}
        </nav>
        <div className="navbar__actions">
          <button
            type="button"
            className="navbar__cart-btn"
            onClick={() => setCartOpen(true)}
            aria-label={t('cart.title')}
          >
            <ShoppingBag size={22} />
            {cart.itemCount > 0 && <span className="navbar__cart-badge">{cart.itemCount}</span>}
          </button>
          <LanguageSwitcher />
        </div>
      </div>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
