import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
    const { i18n } = useTranslation();
    const lang = i18n.language;

    const toggle = (l) => {
        i18n.changeLanguage(l);
        localStorage.setItem('agritech_lang', l);
        // Update html lang attribute for Devanagari font
        document.documentElement.lang = l;
    };

    return (
        <div className="lang-toggle" role="group" aria-label="Language selector">
            <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => toggle('en')}>EN</button>
            <button className={`lang-btn${lang === 'hi' ? ' active' : ''}`} onClick={() => toggle('hi')}>हि</button>
        </div>
    );
}
