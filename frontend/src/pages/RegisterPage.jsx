import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
    const { t, i18n } = useTranslation();
    const { register, loading, error } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ok = await register(email, password, i18n.language.startsWith('hi') ? 'hi' : 'en');
        if (ok) navigate('/');
    };

    return (
        <div className="page-wrapper">
            <div className="container" style={{ maxWidth: 420, paddingTop: '3rem' }}>
                <div className="card">
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <span style={{ fontSize: '2.5rem' }}>🌾</span>
                        <h2 style={{ marginTop: '0.5rem' }}>{t('auth.register_title')}</h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-email">{t('auth.email')}</label>
                            <input
                                id="reg-email"
                                type="email"
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-password">{t('auth.password')}</label>
                            <input
                                id="reg-password"
                                type="password"
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                autoComplete="new-password"
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Minimum 6 characters</span>
                        </div>
                        {error && (
                            <div style={{
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '0.6rem 0.9rem',
                                color: 'var(--red-400)',
                                fontSize: '0.875rem',
                                marginBottom: '1rem',
                            }}>
                                {error}
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary w-full" disabled={loading} id="register-submit">
                            {loading ? t('common.loading') : t('auth.register_btn')}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {t('auth.have_account')}{' '}
                        <Link to="/login">{t('auth.login_link')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
