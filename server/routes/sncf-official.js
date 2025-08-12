const express = require('express');
const axios = require('axios');
const router = express.Router();

// Config API SNCF Officielle (Navitia)
const SNCF_API_BASE = 'https://api.sncf.com/v1/coverage/sncf';
const SNCF_API_KEY = process.env.SNCF_OFFICIAL_API_KEY || process.env.SNCF_API_KEY || '960e391d-c9d0-4bc5-935e-3b21bbdcf628';

// Mappings rapides pour tests (villes -> admin codes, gares -> stop_area ids)
const ADMIN_CODES = new Map([
  ['PARIS', 'admin:fr:75056'],
  ['LYON', 'admin:fr:69123'],
  ['MARSEILLE', 'admin:fr:13055'],
  ['BORDEAUX', 'admin:fr:33063'],
  ['NANTES', 'admin:fr:44109'],
  ['LILLE', 'admin:fr:59350'],
  ['RENNES', 'admin:fr:35238'],
  ['TOULOUSE', 'admin:fr:31555'],
]);

const STOP_AREAS = new Map([
  ['MONTPARNASSE', 'stop_area:SNCF:87391003'], // Paris Montparnasse
  ['GARE DE LYON', 'stop_area:SNCF:8775800'],  // Paris Gare de Lyon (approx)
]);

function toAdminCode(cityOrCode) {
  if (!cityOrCode) return null;
  const upper = String(cityOrCode).trim().toUpperCase();
  if (upper.includes('admin:')) return upper; // déjà un code
  return ADMIN_CODES.get(upper) || null;
}

function toStopAreaId(stationOrId) {
  if (!stationOrId) return null;
  const upper = String(stationOrId).trim().toUpperCase();
  if (upper.startsWith('STOP_AREA:')) return stationOrId; // déjà un id
  return STOP_AREAS.get(upper) || null;
}

function isoDateFromParts(date, time) {
  const d = (date || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
  const t = time && /^\d{6}$/.test(time) ? time : '080000';
  return `${d}T${t}`;
}

function mapJourneyToTrain(journey) {
  const first = journey.sections && journey.sections[0];
  const last = journey.sections && journey.sections[journey.sections.length - 1];
  if (!first || !last) return null;

  const departureIso = first.departure_date_time ? new Date(first.departure_date_time).toISOString() : new Date().toISOString();
  const arrivalIso = last.arrival_date_time ? new Date(last.arrival_date_time).toISOString() : new Date().toISOString();

  // Durée
  const dep = new Date(departureIso);
  const arr = new Date(arrivalIso);
  const durationMin = Math.max(0, Math.round((arr - dep) / 60000));
  const hours = Math.floor(durationMin / 60);
  const minutes = durationMin % 60;

  const headsign = first.display_informations?.headsign || last.display_informations?.headsign || '';
  const trainNumber = headsign ? `TGV ${headsign}` : 'TGV';

  return {
    id: journey.id || `${first.from?.name || 'DEP'}-${last.to?.name || 'ARR'}-${departureIso}`,
    departureStation: first.from?.name || 'Inconnu',
    arrivalStation: last.to?.name || 'Inconnu',
    departureTime: departureIso,
    arrivalTime: arrivalIso,
    duration: `${hours}h${String(minutes).padStart(2, '0')}`,
    trainNumber,
    platform: first.stop_date_time?.platform || undefined,
    price: null, // L'API officielle ne fournit pas les prix/TGVmax; laissé à null
    originalRecord: journey,
  };
}

// GET /api/sncf-official/journeys?from=Paris&to=Lyon&date=YYYY-MM-DD&time=HHmmss
router.get('/journeys', async (req, res) => {
  try {
    const { from = 'Paris', to = 'Lyon', date, time, count = 50 } = req.query;
    const fromCode = toAdminCode(from);
    const toCode = toAdminCode(to);

    if (!fromCode || !toCode) {
      return res.status(400).json({ success: false, error: 'from/to non reconnus (codes admin manquants)' });
    }

    const datetime = isoDateFromParts(date, time);

    const response = await axios.get(`${SNCF_API_BASE}/journeys`, {
      auth: { username: SNCF_API_KEY, password: '' },
      params: { from: fromCode, to: toCode, datetime, count: Number(count), data_freshness: 'realtime' },
      timeout: 15000,
    });

    const journeys = response.data?.journeys || [];
    const trains = journeys.map(mapJourneyToTrain).filter(Boolean);

    return res.json({ success: true, trains, search: { from, to, date, time, count: Number(count), source: 'SNCF Official' } });
  } catch (error) {
    console.error('❌ Erreur /sncf-official/journeys:', error.message);
    return res.status(500).json({ success: false, error: 'Erreur API SNCF officielle', message: error.message });
  }
});

// GET /api/sncf-official/departures?station=Montparnasse&date=YYYY-MM-DD&time=HHmmss
router.get('/departures', async (req, res) => {
  try {
    const { station = 'Montparnasse', date, time, count = 50 } = req.query;
    const stopAreaId = toStopAreaId(station);
    if (!stopAreaId) {
      return res.status(400).json({ success: false, error: 'station non reconnue (stop_area id manquant)' });
    }

    const datetime = isoDateFromParts(date, time);

    const response = await axios.get(`${SNCF_API_BASE}/stop_areas/${encodeURIComponent(stopAreaId)}/departures`, {
      auth: { username: SNCF_API_KEY, password: '' },
      params: { datetime, count: Number(count), data_freshness: 'realtime' },
      timeout: 15000,
    });

    const departures = response.data?.departures || [];
    const trains = departures.map((dep) => {
      const di = dep.display_informations || {};
      const departureIso = dep.stop_date_time?.departure_date_time ? new Date(dep.stop_date_time.departure_date_time).toISOString() : new Date().toISOString();
      return {
        id: dep.display_informations?.trip_short_name || dep.stop_point?.id || `${station}-${departureIso}`,
        departureStation: dep.stop_point?.name || station,
        arrivalStation: di.direction || '—',
        departureTime: departureIso,
        arrivalTime: departureIso,
        duration: '—',
        trainNumber: di.headsign ? `TGV ${di.headsign}` : di.label || '—',
        platform: dep.stop_date_time?.platform || undefined,
        price: null,
        originalRecord: dep,
      };
    });

    return res.json({ success: true, trains, search: { station, date, time, count: Number(count), source: 'SNCF Official' } });
  } catch (error) {
    console.error('❌ Erreur /sncf-official/departures:', error.message);
    return res.status(500).json({ success: false, error: 'Erreur API SNCF officielle', message: error.message });
  }
});

module.exports = router;


