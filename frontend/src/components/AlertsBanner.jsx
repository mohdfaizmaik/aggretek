import { useTranslation } from 'react-i18next';

export default function AlertsBanner({ alerts }) {
    const { t, i18n } = useTranslation();
    const isHi = i18n.language.startsWith('hi');

    if (!alerts?.length) return null;

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>🌱 {t('alerts.title')}</h3>
            <div className="flex flex-col gap-2">
                {alerts.map((alert, i) => {
                    const message = isHi ? alert.message_hi : alert.message_en;
                    const isWarning = alert.severity === 'warning';
                    return (
                        <div
                            key={`${alert.type}-${alert.crop}-${i}`}
                            className="card-sm"
                            style={{
                                borderColor: isWarning ? 'var(--amber-500)' : 'var(--green-600)',
                                background: isWarning ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)',
                                padding: '0.75rem 1rem',
                            }}
                        >
                            <div className="text-sm">
                                <span style={{ fontWeight: 600 }}>
                                    {isHi ? alert.crop_hi : alert.crop}
                                </span>
                                {' · '}
                                <span className="text-muted">
                                    {alert.type === 'sow' ? t('alerts.sow') : t('alerts.harvest')}
                                </span>
                            </div>
                            <p className="text-sm" style={{ marginTop: '0.35rem', color: 'var(--text-secondary)' }}>
                                {message}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
