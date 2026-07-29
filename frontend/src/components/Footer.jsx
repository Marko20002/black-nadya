import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { pickTranslated } from '../i18n/pickTranslated';
import './Footer.css';

export default function Footer() {
  const { settings } = useSiteSettings();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const social = settings?.social_links || {};

  const footerText = pickTranslated(settings, 'footer_text', lang) || `© ${new Date().getFullYear()} Black Nadya. All rights reserved.`;

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          {settings?.logo_image ? (
            <img src={settings.logo_image} alt="Black Nadya" className="footer__logo" />
          ) : (
            <span className="footer__brand-text">BLACK NADYA</span>
          )}
          <p className="footer__tagline">{t('footer.tagline')}</p>
        </div>

        <div className="footer__links">
          <Link to="/products">{t('nav.products')}</Link>
          <Link to="/where-to-buy">{t('nav.whereToBuy')}</Link>
          <Link to="/about">{t('nav.about')}</Link>
          <Link to="/contact">{t('nav.contact')}</Link>
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
        <p>{footerText}</p>
      </div>
    </footer>
  );
}
