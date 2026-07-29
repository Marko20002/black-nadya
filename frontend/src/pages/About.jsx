import { useSiteSettings } from '../hooks/useSiteSettings';
import Loader from '../components/Loader';
import './About.css';

export default function About() {
  const { settings, loading } = useSiteSettings();

  if (loading) return <Loader label="Loading…" />;

  return (
    <div className="section">
      <div className="container about-page">
        <span className="eyebrow">About Us</span>
        <h1>Our Story</h1>
        <hr className="rule-gold" />
        <div className="about-page__body">
          {settings?.about_us_image && (
            <img src={settings.about_us_image} alt="Black Nadya" className="about-page__image" />
          )}
          <div
            className="about-page__text"
            dangerouslySetInnerHTML={{ __html: settings?.about_us_text || '<p>Our story is coming soon.</p>' }}
          />
        </div>
      </div>
    </div>
  );
}
