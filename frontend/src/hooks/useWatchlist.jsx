import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from './useAuth';

const WatchlistContext = createContext({
    items: [],
    loading: false,
    refresh: () => {},
    isWatched: () => false,
    getWatchlistId: () => null,
});

export function WatchlistProvider({ children }) {
    const { isLoggedIn } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        if (!localStorage.getItem('agritech_token')) {
            setItems([]);
            return;
        }
        setLoading(true);
        try {
            const res = await api.getWatchlist();
            setItems(res.data);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isLoggedIn) refresh();
        else setItems([]);
    }, [isLoggedIn, refresh]);

    const isWatched = useCallback((commodityId, marketId) => {
        return items.some(
            (w) => w.commodity_id === commodityId && (marketId ? w.market_id === marketId : !w.market_id)
        );
    }, [items]);

    const getWatchlistId = useCallback((commodityId, marketId) => {
        const found = items.find(
            (w) => w.commodity_id === commodityId && (marketId ? w.market_id === marketId : !w.market_id)
        );
        return found?.id ?? null;
    }, [items]);

    return (
        <WatchlistContext.Provider value={{ items, loading, refresh, isWatched, getWatchlistId }}>
            {children}
        </WatchlistContext.Provider>
    );
}

export function useWatchlist() {
    return useContext(WatchlistContext);
}
