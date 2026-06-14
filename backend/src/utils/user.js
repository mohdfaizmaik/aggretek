'use strict';

function toPublicUser(row) {
    if (!row) return null;
    return {
        id: row.id,
        email: row.email,
        preferred_lang: row.preferred_lang || 'en',
        village: row.village || null,
        district: row.district || null,
        state: row.state || null,
        latitude: row.latitude != null ? parseFloat(row.latitude) : null,
        longitude: row.longitude != null ? parseFloat(row.longitude) : null,
    };
}

module.exports = { toPublicUser };
