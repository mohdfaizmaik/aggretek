import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api/client';

const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

export function usePrices({ commodity, market, state, days = 7, page = 1, limit = 50, sort = 'price_date', order = 'desc' }) {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const timerRef = useRef(null);

    const fetchPrices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.getPrices({ commodity, market, state, days, page, limit, sort, order });
            setData(res.data.data || []);
            setPagination(res.data.pagination || null);
            setMeta(res.data.meta || null);
        } catch (err) {
            const msg = err.code === 'ECONNABORTED'
                ? 'Server is waking up — please wait a moment and refresh.'
                : (err.response?.data?.error || 'Failed to load prices');
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [commodity, market, state, days, page, limit, sort, order]);

    useEffect(() => {
        fetchPrices();
        timerRef.current = setInterval(fetchPrices, REFRESH_INTERVAL);
        return () => clearInterval(timerRef.current);
    }, [fetchPrices]);

    return { data, pagination, meta, loading, error, refetch: fetchPrices };
}

export function useSparkline({ commodity, market, days = 7 }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!commodity) return;
        setLoading(true);
        api.getSparkline({ commodity, market, days })
            .then((res) => setData(res.data))
            .catch((err) => setError(
                err.code === 'ECONNABORTED'
                    ? 'Server is waking up — chart will load shortly.'
                    : (err.response?.data?.error || 'Failed to load chart')
            ))
            .finally(() => setLoading(false));
    }, [commodity, market, days]);

    return { data, loading, error };
}
