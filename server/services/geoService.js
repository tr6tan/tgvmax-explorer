const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const stationService = require('./stationService');

function normalizeName(name) {
  if (!name) return '';
  return String(name)
    .toUpperCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\./g, '')
    .replace(/\bST\b/g, 'SAINT')
    .replace(/\bSTE\b/g, 'SAINTE')
    .replace(/\bSAINTE\b/g, 'SAINTE')
    .replace(/\s+TGV\b/g, '')
    .replace(/\s+GARE\s+DE\s+/g, ' ')
    .replace(/\s+GARE\s+D[EU]\s+/g, ' ')
    .replace(/\s+CENTRE\b/g, '')
    .replace(/\s+VILLE\b/g, '')
    .replace(/\s+-\s+/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

let extraCoordinates = {};
const EXTRA_COORDS_FILE = path.join(__dirname, '../data/city-coordinates.json');

// Mémoisation en mémoire pour éviter les appels répétés durant une même requête
const runtimeCache = new Map(); // key: normalized name, value: {lat,lng}

// Quelques alias pour des gares/proper nouns difficiles
const ALIASES = new Map([
  ['AIX LES BAINS LE REVARD', 'AIX LES BAINS'],
  ['SAINT RAPHAEL VALESCURE', 'SAINT RAPHAEL'],
  ['VALENCE TGV', 'VALENCE'],
  ['MACON LOCHE TGV', 'MACON LOCHE'],
  ['LYON SAINT EXUPERY TGV', 'LYON SAINT EXUPERY'],
  ['NIMES CENTRE', 'NIMES'],
  ['BESANCON FRANCHE COMTE', 'BESANCON'],
  ['SAINT MAIXENT', "SAINT MAIXENT L ECOLE"],
  ['LA ROCHELLE VILLE', 'LA ROCHELLE'],
  ['RENNES', 'RENNES'],
  ['LE MANS', 'LE MANS'],
  ['TOULON', 'TOULON'],
]);

function applyAliases(normalizedName) {
  const direct = ALIASES.get(normalizedName);
  if (direct) return normalizeName(direct);
  return normalizedName;
}

async function loadExtraCoordinates() {
  try {
    if (await fs.pathExists(EXTRA_COORDS_FILE)) {
      const data = await fs.readJson(EXTRA_COORDS_FILE);
      // Build normalized index
      const index = {};
      Object.entries(data).forEach(([key, value]) => {
        index[normalizeName(key)] = value;
      });
      extraCoordinates = index;
    }
  } catch (err) {
    console.error('Erreur chargement city-coordinates.json:', err.message);
    extraCoordinates = {};
  }
}

loadExtraCoordinates();

async function getCoordinatesForName(rawName) {
  const base = normalizeName(rawName);
  if (!base) return null;
  const name = applyAliases(base);

  // 1) Extra coordinates JSON
  if (extraCoordinates[name]) return extraCoordinates[name];

  // 1 bis) Runtime cache
  if (runtimeCache.has(name)) return runtimeCache.get(name);

  // 2) Station service dataset
  try {
    const stations = await stationService.getAllStations();
    // Try by code, name, city
    const match = stations.find(s => {
      const code = normalizeName(s.code);
      const nm = normalizeName(s.name);
      const city = normalizeName(s.city);
      return code === name || nm === name || city === name;
    });
    if (match && match.coordinates) {
      const coord = { lat: match.coordinates.lat, lng: match.coordinates.lng };
      runtimeCache.set(name, coord);
      return coord;
    }
  } catch (err) {
    // ignore
  }

  // 3) Heuristics: extract city token if available (e.g., "PARIS NORD" -> "PARIS")
  const tokens = name.split(' ');
  if (tokens.length > 1) {
    const cityToken = tokens[0];
    if (extraCoordinates[cityToken]) return extraCoordinates[cityToken];
  }

  // 4) Google Places Text Search (si clé dispo)
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (apiKey) {
    try {
      const query = `${name} France`;
      const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
      const resp = await axios.get(url, {
        params: { query, key: apiKey, language: 'fr', region: 'fr' },
        timeout: 10000,
      });
      const status = resp.data && resp.data.status;
      const results = resp.data && resp.data.results ? resp.data.results : [];
      if (status === 'OK' && results.length > 0 && results[0].geometry && results[0].geometry.location) {
        const { lat, lng } = results[0].geometry.location;
        const coord = { lat, lng };
        // Mémoriser et persister
        extraCoordinates[name] = coord;
        try {
          await fs.ensureFile(EXTRA_COORDS_FILE);
          await fs.writeJson(EXTRA_COORDS_FILE, extraCoordinates, { spaces: 2 });
        } catch (werr) {
          console.warn('Impossible d\'écrire city-coordinates.json:', werr.message);
        }
        runtimeCache.set(name, coord);
        return coord;
      } else {
        const detail = resp.data && (resp.data.error_message || status);
        console.warn('Google Places geocoding sans résultat pour', name, '-', detail || 'no detail');
      }
    } catch (gerr) {
      console.warn('Google Places geocoding échec pour', name, '-', gerr.message);
    }
  } else {
    console.warn('GOOGLE_MAPS_API_KEY non défini: géocodage externe désactivé');
  }

  // 5) Fallback OpenStreetMap Nominatim
  try {
    const query = `${name}, France`;
    const url = 'https://nominatim.openstreetmap.org/search';
    const resp = await axios.get(url, {
      params: { q: query, format: 'json', addressdetails: 0, limit: 1 },
      headers: { 'User-Agent': 'tgvmax-explorer/1.0 (dev)' },
      timeout: 10000,
    });
    const results = Array.isArray(resp.data) ? resp.data : [];
    if (results.length > 0 && results[0].lat && results[0].lon) {
      const coord = { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
      extraCoordinates[name] = coord;
      try {
        await fs.ensureFile(EXTRA_COORDS_FILE);
        await fs.writeJson(EXTRA_COORDS_FILE, extraCoordinates, { spaces: 2 });
      } catch (werr) {
        console.warn('Impossible d\'écrire city-coordinates.json (OSM):', werr.message);
      }
      runtimeCache.set(name, coord);
      return coord;
    }
  } catch (oerr) {
    console.warn('OSM geocoding échec pour', name, '-', oerr.message);
  }

  return null;
}

async function runWithConcurrency(items, worker, concurrency = 5) {
  const results = new Array(items.length);
  let currentIndex = 0;

  async function next() {
    const idx = currentIndex++;
    if (idx >= items.length) return;
    try {
      results[idx] = await worker(items[idx], idx);
    } catch (err) {
      results[idx] = null;
    }
    return next();
  }

  const runners = new Array(Math.min(concurrency, items.length)).fill(null).map(next);
  await Promise.all(runners);
  return results;
}

async function enrichTrains(trains) {
  // Dédupliquer les noms à géocoder pour accélérer
  const uniqueNamesSet = new Set();
  for (const t of trains) {
    if (t.departureStation) uniqueNamesSet.add(t.departureStation);
    if (t.arrivalStation) uniqueNamesSet.add(t.arrivalStation);
  }
  const uniqueNames = Array.from(uniqueNamesSet);

  const coordMap = new Map(); // key: normalized name, value: {lat,lng} | null
  await runWithConcurrency(uniqueNames, async (raw) => {
    const coord = await getCoordinatesForName(raw);
    coordMap.set(normalizeName(raw), coord);
  }, 5);

  // Construire les trajets enrichis en piochant dans la map
  return trains.map(t => {
    const dep = coordMap.get(normalizeName(t.departureStation));
    const arr = coordMap.get(normalizeName(t.arrivalStation));
    return {
      ...t,
      departureCoordinates: dep || null,
      arrivalCoordinates: arr || null,
      normalizedDeparture: normalizeName(t.departureStation),
      normalizedArrival: normalizeName(t.arrivalStation),
    };
  });
}

module.exports = {
  normalizeName,
  getCoordinatesForName,
  enrichTrains,
};


