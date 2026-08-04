// Additive data repair: fills in beds/baths/sqft/city/country/amenities on
// property documents that are missing them. Idempotent — never deletes or
// overwrites existing values, so it is safe to run on every server start.
const Property = require('../models/Property');

function bedsForType(type) {
  switch (type) {
    case 'apartment': return 2;
    case 'house': return 3;
    case 'penthouse': return 4;
    case 'villa': return 5;
    case 'loft': return 1;
    default: return 2;
  }
}

const AMENITY_POOL = ['Pool', 'Gym', 'Parking', 'Security', 'Concierge', 'Garden', 'Balcony', 'Fireplace', 'Smart Home', 'Wine Cellar'];

// Deterministic pseudo-random from the document id so values are stable
function seededInt(id, salt, min, max) {
  let hash = 0;
  const str = id.toString() + salt;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return min + (hash % (max - min + 1));
}

async function enrichProperties() {
  const missing = await Property.find({
    $or: [{ beds: null }, { baths: null }, { sqft: null }, { amenities: null }]
  });
  if (missing.length === 0) return 0;

  let updated = 0;
  for (const p of missing) {
    if (p.beds == null) {
      p.beds = Math.max(1, bedsForType(p.type) + seededInt(p._id, 'b', -1, 1));
    }
    if (p.baths == null) {
      p.baths = Math.max(1, p.beds - seededInt(p._id, 'ba', 0, 1));
    }
    if (p.sqft == null) {
      p.sqft = 700 + p.beds * seededInt(p._id, 's', 350, 650);
    }
    if (!p.city && p.location && p.location.includes(',')) {
      p.city = p.location.split(',')[0].trim();
    }
    if (!p.country) p.country = 'USA';
    if (!p.amenities) {
      const start = seededInt(p._id, 'a', 0, AMENITY_POOL.length - 1);
      const count = seededInt(p._id, 'c', 3, 6);
      const picked = [];
      for (let i = 0; i < count; i++) {
        picked.push(AMENITY_POOL[(start + i) % AMENITY_POOL.length]);
      }
      p.amenities = picked.join(', ');
    }
    if (!p.status) p.status = 'available';
    await p.save();
    updated++;
  }
  return updated;
}

module.exports = enrichProperties;
