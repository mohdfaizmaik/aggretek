import { useTranslation } from 'react-i18next';
import { formatDisplayDateTime } from '../utils/formatDate';

export default function FreshnessBadge({ fetchedAt }) {
    const { i18n } = useTranslation();

    if (!fetchedAt) {
        return (
            <span className="freshness-badge">
                <span className="text-muted">—</span>
            </span>
        );
    }

    const label = formatDisplayDateTime(fetchedAt, i18n.language);

    return (
        <span className="freshness-badge" title={label}>
            <span className="freshness-dot" />
            <span className="text-sm">{label}</span>
        </span>
    );
}
