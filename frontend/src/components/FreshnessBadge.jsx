import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';

/**
 * Shows "Updated X min ago" with a pulsing green dot.
 */
export default function FreshnessBadge({ fetchedAt }) {
    const { t } = useTranslation();

    if (!fetchedAt) return <span className="freshness-badge"><span className="text-muted">—</span></span>;

    const date = new Date(fetchedAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);

    let label;
    if (diffMin < 1) label = t('freshness.just_now');
    else if (diffMin < 60) label = t('freshness.min_ago', { count: diffMin });
    else if (diffHr < 24) label = t('freshness.hr_ago', { count: diffHr });
    else label = t('freshness.day_ago', { count: Math.floor(diffHr / 24) });

    return (
        <span className="freshness-badge" title={date.toLocaleString()}>
            <span className="freshness-dot" />
            {label}
        </span>
    );
}
