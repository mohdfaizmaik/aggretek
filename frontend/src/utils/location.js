export const LOCATION_STORAGE_KEY = 'agritech_location';

export const DEFAULT_GUEST_LOCATION = {
    district: 'Nashik',
    state: 'Maharashtra',
};

export function loadGuestLocation() {
    try {
        const stored = JSON.parse(localStorage.getItem(LOCATION_STORAGE_KEY) || 'null');
        if (stored?.district && stored?.state) return stored;
    } catch {
        // ignore
    }
    return { ...DEFAULT_GUEST_LOCATION };
}

export function saveGuestLocation(location) {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
}

export function locationFromUser(user) {
    if (user?.district && user?.state) {
        return { district: user.district, state: user.state };
    }
    return loadGuestLocation();
}
