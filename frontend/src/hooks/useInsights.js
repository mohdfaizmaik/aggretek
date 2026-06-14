import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from './useAuth';
import { loadGuestLocation, locationFromUser } from '../utils/location';

export function useInsights(overrideLocation) {
    const { user, isLoggedIn } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const baseLocation = overrideLocation || locationFromUser(user) || loadGuestLocation();

    const fetchInsights = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (!isLoggedIn || !user?.district) {
                params.district = baseLocation.district;
                params.state = baseLocation.state;
            }
            const res = await api.getInsights(params);
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load weather');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [baseLocation.district, baseLocation.state, isLoggedIn, user?.district]);

    useEffect(() => {
        fetchInsights();
    }, [fetchInsights]);

    return { data, loading, error, refresh: fetchInsights, location: data?.location || baseLocation };
}
