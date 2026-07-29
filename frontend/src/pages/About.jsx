import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { pickTranslated } from '../i18n/pickTranslated';
import Loader from '../components/Loader';
import './About.css';

export default function About() {
  const { settings, loading } = useSiteSettings();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';

  if (loading) return <Loader label={t('about.loading')} />;

  const aboutText = pickTranslated(settings, 'about_us_text', lang) || `<p>${t('about.comingSoon')}</p>`;

  return (
    <div className="section">
      <div className="container about-page">
        <span className="eyebrow">{t('about.eyebrow')}</span>
        <h1>{t('about.title')}</h1>
        <hr className="rule-gold" />
        <div className="about-page__body">
          {settings?.about_us_image && (
            <img src={settings.about_us_image} alt="Black Nadya" className="about-page__image" />
          )}
          <div className="about-page__text" dangerouslySetInnerHTML={{ __html: aboutText }} />
        </div>
      </div>
    </div>
  );
}
