import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useWatchlist } from '../hooks/useWatchlist.jsx';
import { api } from '../api/client';

export default function WatchlistButton({ commodityId, marketId }) {
    const { t } = useTranslation();
    const { isLoggedIn } = useAuth();
    const { getWatchlistId, refresh } = useWatchlist();
    const watchlistId = getWatchlistId(commodityId, marketId);
    const [loading, setLoading] = useState(false);

    if (!isLoggedIn) return (
        <button className="btn-icon" title={t('watchlist.login_prompt')} disabled>
            ☆
        </button>
    );

    const toggle = async () => {
        setLoading(true);
        try {
            if (watchlistId) {
                await api.removeWatchlist(watchlistId);
            } else {
                await api.addWatchlist({ commodity_id: commodityId, market_id: marketId });
            }
            await refresh();
        } catch (e) {
            console.warn('Watchlist error:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={`btn-icon${watchlistId ? ' active' : ''}`}
            onClick={toggle}
            disabled={loading}
            title={watchlistId ? t('watchlist.remove') : t('watchlist.add')}
        >
            {watchlistId ? '⭐' : '☆'}
        </button>
    );
}
