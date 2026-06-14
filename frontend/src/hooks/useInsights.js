import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from './useAuth';
import { loadGuestLocation } from '../utils/location';

function pickLocation(user, isLoggedIn, guestOverride) {
    if (isLoggedIn && user?.district && user?.state) {
        return { district: user.district, state: user.state };
    }
    return guestOverride || loadGuestLocation();
}

export function useInsights(guestOverride) {
    const { user, isLoggedIn } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const activeLocation = pickLocation(user, isLoggedIn, guestOverride);

    const fetchInsights = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                district: activeLocation.district,
                state: activeLocation.state,
            };
            const res = await api.getInsights(params);
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load weather');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [activeLocation.district, activeLocation.state]);

    useEffect(() => {
        fetchInsights();
    }, [fetchInsights]);

    useEffect(() => {
        const onLocationChange = () => fetchInsights();
        window.addEventListener('agritech-location-change', onLocationChange);
        return () => window.removeEventListener('agritech-location-change', onLocationChange);
    }, [fetchInsights]);

    return {
        data,
        loading,
        error,
        refresh: fetchInsights,
        location: data?.location || activeLocation,
    };
}
