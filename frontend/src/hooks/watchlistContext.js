import { createContext } from 'react';

export const WatchlistContext = createContext({
    items: [],
    loading: false,
    refresh: () => {},
    isWatched: () => false,
    getWatchlistId: () => null,
});
