import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'mk', label: 'MK' },
  { code: 'sq', label: 'SQ' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.split('-')[0] || 'en';

  return (
    <div className="language-switcher">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          className={`language-switcher__btn${current === lang.code ? ' language-switcher__btn--active' : ''}`}
          onClick={() => i18n.changeLanguage(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
