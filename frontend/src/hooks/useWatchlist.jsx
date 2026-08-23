import { useContext } from 'react';
import { WatchlistContext } from './watchlistContext';

export function useWatchlist() {
    return useContext(WatchlistContext);
}
