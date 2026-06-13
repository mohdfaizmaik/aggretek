import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import LanguageToggle from './LanguageToggle';

export default function Header() {
    const { t } = useTranslation();
    const { isLoggedIn, logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/'); };

    return (
        <header className="header">
            <div className="container header-inner">
                <NavLink to="/" className="header-logo">
                    <span className="emoji">🌾</span>
                    <span>Agri<span className="logo-accent">मूल्य</span></span>
                </NavLink>

                <nav className="header-nav">
                    <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                        {t('nav.home')}
                    </NavLink>
                    {isLoggedIn && (
                        <NavLink to="/watchlist" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                            ⭐ {t('nav.watchlist')}
                        </NavLink>
                    )}
                    {!isLoggedIn ? (
                        <>
                            <NavLink to="/login" className="btn btn-ghost btn-sm">{t('nav.login')}</NavLink>
                            <NavLink to="/register" className="btn btn-primary btn-sm">{t('nav.register')}</NavLink>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted">{user?.email}</span>
                            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>{t('nav.logout')}</button>
                        </div>
                    )}
                    <LanguageToggle />
                </nav>
            </div>
        </header>
    );
}
