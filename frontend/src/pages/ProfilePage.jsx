import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../api/client';
import { saveGuestLocation } from '../utils/location';

export default function ProfilePage() {
    const { t } = useTranslation();
    const { user, isLoggedIn, updateProfile, loading: authLoading, error: authError } = useAuth();
    const navigate = useNavigate();

    const [village, setVillage] = useState('');
    const [state, setState] = useState('Maharashtra');
    const [district, setDistrict] = useState('Nashik');
    const [locationOptions, setLocationOptions] = useState([]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        api.getLocations()
            .then((res) => setLocationOptions(res.data?.states || []))
            .catch(() => setLocationOptions([]));
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        if (user) {
            setVillage(user.village || '');
            setState(user.state || 'Maharashtra');
            setDistrict(user.district || 'Nashik');
        }
    }, [user]);

    const districtsForState = locationOptions.find((s) => s.state === state)?.districts || [];

    useEffect(() => {
        if (districtsForState.length && !districtsForState.includes(district)) {
            setDistrict(districtsForState[0]);
        }
    }, [state, districtsForState, district]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        setError(null);

        const payload = { village, district, state };
        const ok = await updateProfile(payload);

        if (ok) {
            saveGuestLocation({ district, state });
            setMessage(t('profile.saved'));
            window.dispatchEvent(new Event('agritech-location-change'));
        } else {
            setError(authError || t('profile.save_failed'));
        }
        setSaving(false);
    };

    const handleUseGps = () => {
        if (!navigator.geolocation) {
            setError(t('profile.gps_unavailable'));
            return;
        }
        setSaving(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const ok = await updateProfile({
                    village,
                    district,
                    state,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                });
                setSaving(false);
                if (ok) {
                    setMessage(t('profile.gps_saved'));
                    window.dispatchEvent(new Event('agritech-location-change'));
                } else setError(authError || t('profile.save_failed'));
            },
            () => {
                setSaving(false);
                setError(t('profile.gps_denied'));
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
        );
    };

    return (
        <div className="page-wrapper">
            <div className="container" style={{ maxWidth: 520 }}>
                <h2 style={{ marginBottom: '0.5rem' }}>{t('profile.title')}</h2>
                <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{t('profile.subtitle')}</p>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="profile-village">{t('profile.village')}</label>
                            <input
                                id="profile-village"
                                className="input"
                                value={village}
                                onChange={(e) => setVillage(e.target.value)}
                                placeholder={t('profile.village_placeholder')}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="profile-state">{t('profile.state')}</label>
                            <select
                                id="profile-state"
                                className="input"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                            >
                                {locationOptions.map((s) => (
                                    <option key={s.state} value={s.state}>{s.state}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="profile-district">{t('profile.district')}</label>
                            <select
                                id="profile-district"
                                className="input"
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                            >
                                {districtsForState.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ marginBottom: '1rem' }}
                            onClick={handleUseGps}
                            disabled={saving || authLoading}
                        >
                            📍 {t('profile.use_gps')}
                        </button>

                        {message && (
                            <div style={{
                                background: 'rgba(34,197,94,0.1)',
                                border: '1px solid rgba(34,197,94,0.3)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '0.6rem 0.9rem',
                                color: 'var(--green-400)',
                                fontSize: '0.875rem',
                                marginBottom: '1rem',
                            }}>
                                {message}
                            </div>
                        )}
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

                        <button type="submit" className="btn btn-primary w-full" disabled={saving || authLoading}>
                            {saving ? t('common.loading') : t('profile.save')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
