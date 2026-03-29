import React from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ml', label: 'മലയാളം' },
];

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('fusionnotes_lang', lang);
  };

  return (
    <select
      value={i18n.language}
      onChange={handleChange}
      title="Language"
      style={{
        background: 'var(--bg-glass)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '4px 8px',
        fontSize: '12px',
        cursor: 'pointer',
        outline: 'none',
        backdropFilter: 'blur(12px)',
      }}
    >
      {LANGUAGES.map(lang => (
        <option key={lang.code} value={lang.code} style={{ background: '#1a1a2e', color: '#fff' }}>
          {lang.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;
