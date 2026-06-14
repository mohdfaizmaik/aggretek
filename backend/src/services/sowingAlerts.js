'use strict';
const db = require('../db');

function daysBetween(a, b) {
    const ms = new Date(b) - new Date(a);
    return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function inWindow(today, start, end) {
    const t = new Date(today);
    const s = new Date(start);
    const e = new Date(end);
    return t >= s && t <= e;
}

function buildAlert({ type, severity, crop, crop_hi, message_en, message_hi }) {
    return { type, severity, crop, crop_hi, message_en, message_hi };
}

async function getCropCalendars(state) {
    if (!state) return [];
    const result = await db.query(
        `SELECT cc.*, c.name_en, c.name_hi
         FROM crop_calendar cc
         JOIN commodities c ON c.id = cc.commodity_id
         WHERE cc.state = $1`,
        [state]
    );
    return result.rows;
}

async function getUserWatchlistCropIds(userId) {
    if (!userId) return null;
    const result = await db.query(
        'SELECT DISTINCT commodity_id FROM watchlist WHERE user_id = $1',
        [userId]
    );
    if (result.rows.length === 0) return null;
    return new Set(result.rows.map((r) => r.commodity_id));
}

function evaluateCalendarRow(row, weather, todayStr) {
    const alerts = [];
    const rain3 = Number(weather.rain_next_3d_mm) || 0;
    const temp = Number(weather.current?.temp_c) || 0;
    const daysToSowEnd = daysBetween(todayStr, row.sow_end);

    if (inWindow(todayStr, row.sow_start, row.sow_end)) {
        if (rain3 >= Number(row.min_rain_mm) && temp <= Number(row.max_temp_c)) {
            alerts.push(buildAlert({
                type: 'sow',
                severity: 'info',
                crop: row.name_en,
                crop_hi: row.name_hi,
                message_en: `${row.name_en} sowing window is open. Rain expected (${rain3} mm in 3 days) — good conditions.`,
                message_hi: `${row.name_hi} बुवाई का समय चल रहा है। अगले 3 दिन ${rain3} mm बारिश — अच्छी स्थिति।`,
            }));
        } else if (daysToSowEnd <= 7 && daysToSowEnd >= 0) {
            alerts.push(buildAlert({
                type: 'sow',
                severity: 'warning',
                crop: row.name_en,
                crop_hi: row.name_hi,
                message_en: `${row.name_en} sowing window closes in ${daysToSowEnd} days. Rain may be low (${rain3} mm forecast).`,
                message_hi: `${row.name_hi} बुवाई ${daysToSowEnd} दिन में समाप्त। बारिश कम (${rain3} mm) हो सकती है।`,
            }));
        } else {
            alerts.push(buildAlert({
                type: 'sow',
                severity: 'info',
                crop: row.name_en,
                crop_hi: row.name_hi,
                message_en: `${row.name_en} sowing season is active in ${row.state} until ${row.sow_end}.`,
                message_hi: `${row.state} में ${row.name_hi} की बुवाई ${row.sow_end} तक चलती है।`,
            }));
        }
    }

    if (inWindow(todayStr, row.harvest_start, row.harvest_end)) {
        alerts.push(buildAlert({
            type: 'harvest',
            severity: 'info',
            crop: row.name_en,
            crop_hi: row.name_hi,
            message_en: `${row.name_en} harvest season is active in ${row.state}.`,
            message_hi: `${row.state} में ${row.name_hi} की कटाई का season चल रहा है।`,
        }));

        if (rain3 >= 40) {
            alerts.push(buildAlert({
                type: 'harvest',
                severity: 'warning',
                crop: row.name_en,
                crop_hi: row.name_hi,
                message_en: `Heavy rain (${rain3} mm) forecast during ${row.name_en} harvest — plan drying/storage.`,
                message_hi: `कटाई के दौरान भारी बारिश (${rain3} mm) — सुखाने/भंडारण की योजना बनाएं।`,
            }));
        }
    }

    return alerts;
}

async function getSowingAlerts({ state, weather, userId }) {
    if (!state || !weather) return [];

    const calendars = await getCropCalendars(state);
    if (calendars.length === 0) return [];

    const watchIds = await getUserWatchlistCropIds(userId);
    const todayStr = new Date().toISOString().slice(0, 10);

    const filtered = watchIds
        ? calendars.filter((row) => watchIds.has(row.commodity_id))
        : calendars.slice(0, 4);

    const alerts = [];
    for (const row of filtered) {
        alerts.push(...evaluateCalendarRow(row, weather, todayStr));
    }

    const order = { warning: 0, info: 1 };
    alerts.sort((a, b) => (order[a.severity] ?? 2) - (order[b.severity] ?? 2));

    return alerts.slice(0, 6);
}

module.exports = { getSowingAlerts, evaluateCalendarRow, inWindow };
