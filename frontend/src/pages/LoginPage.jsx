import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
    const { t } = useTranslation();
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ok = await login(email, password);
        if (ok) navigate('/');
    };

    return (
        <div className="page-wrapper">
            <div className="container" style={{ maxWidth: 420, paddingTop: '3rem' }}>
                <div className="card">
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <span style={{ fontSize: '2.5rem' }}>🌾</span>
                        <h2 style={{ marginTop: '0.5rem' }}>{t('auth.login_title')}</h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="login-email">{t('auth.email')}</label>
                            <input
                                id="login-email"
                                type="email"
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="login-password">{t('auth.password')}</label>
                            <input
                                id="login-password"
                                type="password"
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
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
                                <div>{error === 'Invalid email or password' ? t('auth.invalid_credentials') : error}</div>
                                {error === 'Invalid email or password' && (
                                    <div style={{ marginTop: '0.5rem' }}>{t('auth.try_register')}</div>
                                )}
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary w-full" disabled={loading} id="login-submit">
                            {loading ? t('common.loading') : t('auth.login_btn')}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {t('auth.no_account')}{' '}
                        <Link to="/register">{t('auth.register_link')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
