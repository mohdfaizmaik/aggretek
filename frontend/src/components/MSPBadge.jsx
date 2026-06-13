import { useTranslation } from 'react-i18next';

/**
 * Shows a green/red/neutral badge based on whether modal price is above/below MSP.
 */
export default function MSPBadge({ status, mspPrice }) {
    const { t } = useTranslation();

    if (!status || status === 'na') {
        return <span className="msp-badge na">{t('msp.na')}</span>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span className={`msp-badge ${status}`}>
                {status === 'above' ? '▲' : '▼'} {t(`msp.${status}`)}
            </span>
            {mspPrice && (
                <span className="text-xs text-muted font-mono">MSP: ₹{Number(mspPrice).toLocaleString('en-IN')}</span>
            )}
        </div>
    );
}
