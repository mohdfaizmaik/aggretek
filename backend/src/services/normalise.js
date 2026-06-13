'use strict';
/**
 * Crop name normalisation
 * Maps raw API/CSV names (English, Hindi, transliteration) → canonical English name
 */

const ALIAS_MAP = {
  // Cereals
  wheat: 'Wheat', gehu: 'Wheat', gehun: 'Wheat', 'गेहूँ': 'Wheat', गेहू: 'Wheat',
  rice: 'Rice', paddy: 'Rice', dhan: 'Rice', dhaan: 'Rice', 'चावल': 'Rice', 'धान': 'Rice',
  maize: 'Maize', makka: 'Maize', corn: 'Maize', 'मक्का': 'Maize',
  bajra: 'Bajra', 'pearl millet': 'Bajra', 'बाजरा': 'Bajra',
  jowar: 'Jowar', sorghum: 'Jowar', 'ज्वार': 'Jowar',
  barley: 'Barley', jau: 'Barley', 'जौ': 'Barley',

  // Oilseeds
  soybean: 'Soybean', soyabean: 'Soybean', soy: 'Soybean', 'सोयाबीन': 'Soybean',
  mustard: 'Mustard', sarson: 'Mustard', rapeseed: 'Mustard', 'सरसों': 'Mustard',
  groundnut: 'Groundnut', moongfali: 'Groundnut', peanut: 'Groundnut', 'मूँगफली': 'Groundnut',
  sunflower: 'Sunflower', surajmukhi: 'Sunflower', 'सूरजमुखी': 'Sunflower',

  // Pulses
  chana: 'Chana', gram: 'Chana', chickpea: 'Chana', 'चना': 'Chana',
  'tur dal': 'Tur Dal', arhar: 'Tur Dal', toor: 'Tur Dal', tur: 'Tur Dal', 'तुअर दाल': 'Tur Dal', 'अरहर': 'Tur Dal',
  moong: 'Moong', mung: 'Moong', 'green gram': 'Moong', 'मूंग': 'Moong',
  'urad dal': 'Urad Dal', urad: 'Urad Dal', 'black gram': 'Urad Dal', 'उड़द दाल': 'Urad Dal', उड़द: 'Urad Dal',

  // Vegetables
  onion: 'Onion', pyaaz: 'Onion', pyaj: 'Onion', 'प्याज': 'Onion',
  potato: 'Potato', aloo: 'Potato', 'आलू': 'Potato',
  tomato: 'Tomato', tamatar: 'Tomato', 'टमाटर': 'Tomato',

  // Cash crops / others
  cotton: 'Cotton', kapas: 'Cotton', 'कपास': 'Cotton',
  sugarcane: 'Sugarcane', ganna: 'Sugarcane', 'गन्ना': 'Sugarcane',
  turmeric: 'Turmeric', haldi: 'Turmeric', 'हल्दी': 'Turmeric',
};

/**
 * Normalise a raw crop name to canonical English name.
 * @param {string} rawName
 * @returns {string|null} canonical name or null if unrecognised
 */
function normaliseCropName(rawName) {
  if (!rawName) return null;
  const key = rawName.trim().toLowerCase().replace(/\s+/g, ' ');
  return ALIAS_MAP[key] || ALIAS_MAP[rawName.trim()] || null;
}

/**
 * Normalise a market/mandi name.
 * Strips common suffixes and normalises spacing.
 */
function normaliseMarketName(rawName) {
  if (!rawName) return rawName;
  return rawName
    .trim()
    .replace(/\s*\(.*?\)\s*/g, '')  // remove parenthetical abbreviations
    .replace(/\s+/g, ' ')
    .replace(/\bMandi\b/gi, '')
    .trim();
}

module.exports = { normaliseCropName, normaliseMarketName, ALIAS_MAP };
