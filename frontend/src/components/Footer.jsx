import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import './Footer.css';

export default function Footer() {
  const { settings } = useSiteSettings();
  const social = settings?.social_links || {};

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          {settings?.logo_image ? (
            <img src={settings.logo_image} alt="Black Nadya" className="footer__logo" />
          ) : (
            <span className="footer__brand-text">BLACK NADYA</span>
          )}
          <p className="footer__tagline">Natural Cosmetics</p>
        </div>

        <div className="footer__links">
          <Link to="/products">Products</Link>
          <Link to="/where-to-buy">Where to Buy</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer__social">
          {Object.entries(social).map(([name, url]) => (
            <a key={name} href={url} target="_blank" rel="noreferrer">
              {name}
            </a>
          ))}
        </div>
      </div>
      <div className="footer__bottom">
        <p>{settings?.footer_text || `© ${new Date().getFullYear()} Black Nadya. All rights reserved.`}</p>
      </div>
    </footer>
  );
}
