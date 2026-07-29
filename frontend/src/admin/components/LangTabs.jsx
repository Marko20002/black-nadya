const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'mk', label: 'Македонски' },
  { code: 'sq', label: 'Shqip' },
];

export default function LangTabs({ active, onChange }) {
  return (
    <div className="lang-tabs">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          className={`lang-tabs__btn${active === lang.code ? ' lang-tabs__btn--active' : ''}`}
          onClick={() => onChange(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
