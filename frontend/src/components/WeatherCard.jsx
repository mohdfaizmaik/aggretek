import { useTranslation } from 'react-i18next';
import { formatChartDate } from '../utils/formatDate';

function rainLabel(mm, t) {
    const n = Number(mm) || 0;
    if (n <= 0) return t('weather.no_rain');
    return t('weather.rain_mm', { mm: n });
}

export default function WeatherCard({ weather, loading, error, location, onRetry }) {
    const { t, i18n } = useTranslation();
    const isHi = i18n.language.startsWith('hi');

    if (loading && !weather) {
        return (
            <div className="card weather-card" style={{ marginBottom: '1.5rem' }}>
                <p className="text-muted">{t('weather.loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card weather-card" style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--red-400)', fontSize: '0.875rem' }}>{error}</p>
                {onRetry && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={onRetry}>
                        {t('common.retry')}
                    </button>
                )}
            </div>
        );
    }

    if (!weather) return null;

    const { current, daily, location: loc } = weather;
    const place = loc?.district || location?.district;
    const state = loc?.state || location?.state;
    const condition = isHi ? current?.condition_hi : current?.condition_en;

    return (
        <div className="card weather-card" style={{ marginBottom: '1.5rem' }}>
            <div className="flex items-center justify-between gap-2" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>
                    🌤️ {t('weather.title')}
                </h3>
                <span className="text-sm text-muted">
                    {place}{state ? `, ${state}` : ''}
                </span>
            </div>

            <div className="weather-current flex items-center gap-4" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div>
                    <span style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                        {current?.temp_c != null ? `${Math.round(current.temp_c)}°C` : '—'}
                    </span>
                    <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>{condition}</p>
                </div>
                <div className="text-sm text-muted">
                    <div>{t('weather.humidity')}: {current?.humidity_pct ?? '—'}%</div>
                    <div>{rainLabel(current?.rainfall_mm, t)}</div>
                    {weather.rain_next_3d_mm != null && (
                        <div>{t('weather.rain_3d')}: {weather.rain_next_3d_mm} mm</div>
                    )}
                </div>
            </div>

            {daily?.length > 0 && (
                <div>
                    <h4 className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>{t('weather.forecast_7d')}</h4>
                    <div className="weather-forecast-grid">
                        {daily.map((day) => (
                            <div key={day.date} className="weather-day card-sm">
                                <div className="text-xs text-muted">{formatChartDate(day.date, i18n.language)}</div>
                                <div className="text-sm" style={{ marginTop: '0.25rem' }}>
                                    {day.temp_max != null ? `${Math.round(day.temp_min)}–${Math.round(day.temp_max)}°` : '—'}
                                </div>
                                <div className="text-xs text-muted">{rainLabel(day.rain_mm, t)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
