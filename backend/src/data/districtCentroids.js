'use strict';

/** District + state centroids for MH, MP, Delhi (Phase 1 focus markets). */
const DISTRICTS = {
    Maharashtra: {
        Nashik: { lat: 19.9975, lon: 73.7898 },
        Pune: { lat: 18.5204, lon: 73.8567 },
        Nagpur: { lat: 21.1458, lon: 79.0882 },
        Mumbai: { lat: 19.076, lon: 72.8777 },
        Aurangabad: { lat: 19.8762, lon: 75.3433 },
    },
    'Madhya Pradesh': {
        Indore: { lat: 22.7196, lon: 75.8577 },
        Bhopal: { lat: 23.2599, lon: 77.4126 },
        Ujjain: { lat: 23.1765, lon: 75.7885 },
        Gwalior: { lat: 26.2183, lon: 78.1828 },
    },
    Delhi: {
        Delhi: { lat: 28.6139, lon: 77.209 },
        'New Delhi': { lat: 28.6139, lon: 77.209 },
    },
};

const STATE_CENTROIDS = {
    Maharashtra: { lat: 19.7515, lon: 75.7139 },
    'Madhya Pradesh': { lat: 22.9734, lon: 78.6569 },
    Delhi: { lat: 28.6139, lon: 77.209 },
};

const DEFAULT_LOCATION = { district: 'Nashik', state: 'Maharashtra', ...DISTRICTS.Maharashtra.Nashik };

function listDistricts(state) {
    if (!state || !DISTRICTS[state]) return [];
    return Object.keys(DISTRICTS[state]);
}

function listStates() {
    return Object.keys(STATE_CENTROIDS);
}

function resolveLocation({ district, state, latitude, longitude } = {}) {
    const latNum = latitude != null ? Number(latitude) : null;
    const lonNum = longitude != null ? Number(longitude) : null;

    if (latNum != null && lonNum != null && !Number.isNaN(latNum) && !Number.isNaN(lonNum)) {
        return {
            district: district || null,
            state: state || null,
            latitude: latNum,
            longitude: lonNum,
        };
    }

    const st = state && STATE_CENTROIDS[state] ? state : DEFAULT_LOCATION.state;
    const districts = DISTRICTS[st] || {};
    const distKey = district && districts[district] ? district : Object.keys(districts)[0];
    const coords = districts[distKey] || STATE_CENTROIDS[st] || DEFAULT_LOCATION;

    return {
        district: distKey || null,
        state: st,
        latitude: coords.lat,
        longitude: coords.lon,
    };
}

module.exports = {
    DISTRICTS,
    STATE_CENTROIDS,
    DEFAULT_LOCATION,
    listDistricts,
    listStates,
    resolveLocation,
};
