import { format } from 'date-fns';
import { enIN } from 'date-fns/locale/en-IN';
import { hi } from 'date-fns/locale/hi';

const LOCALES = { en: enIN, hi };

function parseDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

function localeFor(lang) {
    return LOCALES[lang?.startsWith('hi') ? 'hi' : 'en'] || enIN;
}

/** e.g. 13 Jun 2026 14:30 */
export function formatDisplayDateTime(value, lang = 'en') {
    const d = parseDate(value);
    if (!d) return '—';
    return format(d, 'd MMM yyyy HH:mm', { locale: localeFor(lang) });
}

/** e.g. 13 Jun 2026 — omits time when value is date-only (midnight UTC) */
export function formatDisplayDate(value, lang = 'en') {
    const d = parseDate(value);
    if (!d) return '—';
    const isDateOnly = d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0;
    if (isDateOnly) {
        return format(d, 'd MMM yyyy', { locale: localeFor(lang) });
    }
    return format(d, 'd MMM yyyy HH:mm', { locale: localeFor(lang) });
}

/** Short label for chart axis — e.g. 13 Jun */
export function formatChartDate(value, lang = 'en') {
    const d = parseDate(value);
    if (!d) return '';
    return format(d, 'd MMM', { locale: localeFor(lang) });
}
