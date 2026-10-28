require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('./models/Property');

// ==================== HELPERS ====================
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const apartmentImages = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop',
];

const amenitiesPool = [
  'Gym', 'Parking', 'Security', 'Concierge', 'Balcony', 'Elevator',
  'Laundry', 'Air Conditioning', 'Heating', 'Pet Friendly', 'Rooftop', 'Storage',
];

const tags = [
  'Luxury', 'Modern', 'Renovated', 'Downtown', 'Urban',
  'Serene', 'Cozy', 'Spacious', 'Sunny', 'Premium',
];

function getRandomAmenities() {
  const shuffled = [...amenitiesPool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, randomInt(4, 6)).join(', ');
}

const getRandomTag = () => tags[Math.floor(Math.random() * tags.length)];
const getRandomImage = () => apartmentImages[Math.floor(Math.random() * apartmentImages.length)];

// ==================== UNIT SPECS ====================
// studio $900 | 1bd $1,100 | 2bd $1,700 | 3bd $1,900
const specMap = {
  studio: { label: 'Studio', type: 'apartment', beds: 1, baths: 1, price: 900, sqft: [400, 650] },
  '1bd':  { label: '1-Bedroom', type: 'apartment', beds: 1, baths: 1, price: 1100, sqft: [600, 850]   },
  '2bd':  { label: '2-Bedroom', type: 'apartment', beds: 2, baths: 2, price: 1700, sqft: [850, 1100]  },
  '3bd':  { label: '3-Bedroom', type: 'apartment', beds: 3, baths: 2, price: 1900, sqft: [1100, 1400] },
};

// ==================== CITIES ====================
const cityOrder = ['Chicago', 'Philadelphia', 'Los Angeles', 'Boston', 'Austin'];

const locMeta = {
  Chicago:       { state: 'Illinois' },
  Philadelphia:  { state: 'Pennsylvania' },
  'Los Angeles': { state: 'California' },
  Boston:        { state: 'Massachusetts' },
  Austin:        { state: 'Texas' },
};

const neighborhoods = {
  Chicago:       ['Lincoln Park', 'Wicker Park', 'The Loop', 'River North', 'Logan Square', 'Hyde Park'],
  Philadelphia:  ['Center City', 'Rittenhouse', 'Old City', 'Fishtown', 'University City', 'Northern Liberties'],
  'Los Angeles': ['Silver Lake', 'Downtown LA', 'Santa Monica', 'Echo Park', 'Koreatown', 'Venice'],
  Boston:        ['Back Bay', 'Beacon Hill', 'South End', 'Cambridge', 'Seaport', 'North End'],
  Austin:        ['Downtown Austin', 'South Congress', 'East Austin', 'Zilker', 'Mueller', 'Rainey Street'],
};

// 6 units per city: 2 studios, 2×1bd, 1×2bd, 1×3bd
const pattern = ['studio', '1bd', 'studio', '2bd', '1bd', '3bd'];

// ==================== MAIN SEED ====================
async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Property.deleteMany({});
    console.log('🗑️ Cleared existing properties');

    const properties = [];

    cityOrder.forEach((city) => {
      const { state } = locMeta[city];
      neighborhoods[city].forEach((neighborhood, idx) => {
        const spec = specMap[pattern[idx]];

        properties.push({
          title: `${spec.label} in ${neighborhood}, ${city}`,
          description:
            `${spec.label} apartment in the ${neighborhood} neighborhood of ${city}, ${state}. ` +
            `Well-maintained building with modern finishes and convenient access to transit, dining, and shopping.`,
          price: spec.price,
          location: `${city}, ${state}`,
          city,
          state,
          country: 'USA',
          image: getRandomImage(),
          type: spec.type,                 // 'studio' (Option A) or 'apartment' (Option B)
          tag: getRandomTag(),
          sqft: randomInt(spec.sqft[0], spec.sqft[1]),
          beds: spec.beds,
          baths: spec.baths,
          amenities: getRandomAmenities(),
          rating: parseFloat((4.0 + Math.random()).toFixed(1)),
          featured: Math.random() > 0.5,
          status: 'available',
          createdAt: new Date(),
        });
      });
    });

    await Property.insertMany(properties);
    console.log(`✅ Seeded ${properties.length} properties`);

    const byCity = {};
    properties.forEach((p) => { byCity[p.city] = (byCity[p.city] || 0) + 1; });
    console.log('📊 By city:', byCity);

    const byType = {};
    properties.forEach((p) => { byType[p.type] = (byType[p.type] || 0) + 1; });
    console.log('📊 By type:', byType);

    const states = [...new Set(properties.map((p) => p.state))];
    console.log(`📊 States covered: ${states.length} (${states.join(', ')})`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seedDatabase();