import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { loadGuestLocation, saveGuestLocation } from '../utils/location';
import { useAuth } from '../hooks/useAuth';

export default function GuestLocationPicker({ onChange }) {
    const { t } = useTranslation();
    const { isLoggedIn } = useAuth();
    const [options, setOptions] = useState([]);
    const guest = loadGuestLocation();
    const [state, setState] = useState(guest.state);
    const [district, setDistrict] = useState(guest.district);

    useEffect(() => {
        api.getLocations()
            .then((res) => setOptions(res.data?.states || []))
            .catch(() => setOptions([]));
    }, []);

    if (isLoggedIn) {
        return (
            <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
                {t('weather.profile_hint')}{' '}
                <Link to="/profile">{t('nav.profile')}</Link>
            </p>
        );
    }

    const districts = options.find((s) => s.state === state)?.districts || [];

    const apply = (nextState, nextDistrict) => {
        const loc = { state: nextState, district: nextDistrict };
        saveGuestLocation(loc);
        onChange?.(loc);
    };

    return (
        <div className="flex gap-2 items-end" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div style={{ minWidth: '140px' }}>
                <label className="form-label">{t('profile.state')}</label>
                <select
                    className="input"
                    value={state}
                    onChange={(e) => {
                        const nextState = e.target.value;
                        const nextDistrict = options.find((s) => s.state === nextState)?.districts?.[0] || district;
                        setState(nextState);
                        setDistrict(nextDistrict);
                        apply(nextState, nextDistrict);
                    }}
                >
                    {options.map((s) => (
                        <option key={s.state} value={s.state}>{s.state}</option>
                    ))}
                </select>
            </div>
            <div style={{ minWidth: '140px' }}>
                <label className="form-label">{t('profile.district')}</label>
                <select
                    className="input"
                    value={district}
                    onChange={(e) => {
                        setDistrict(e.target.value);
                        apply(state, e.target.value);
                    }}
                >
                    {districts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
