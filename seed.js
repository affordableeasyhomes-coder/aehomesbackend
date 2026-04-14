require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('./models/Property');

// ==================== HELPER FUNCTIONS (matching PHP logic) ====================
function getRandomPropertyType() {
  const types = ['apartment', 'house', 'penthouse', 'villa', 'loft'];
  return types[Math.floor(Math.random() * types.length)];
}

function getRandomTag() {
  const tags = ['Luxury', 'Modern', 'Historic', 'Renovated', 'Waterfront', 'Mountain View', 'Downtown', 'Suburban', 'Urban', 'Serene'];
  return tags[Math.floor(Math.random() * tags.length)];
}

function getRandomBeds(type) {
  switch (type) {
    case 'apartment': return Math.floor(Math.random() * 3) + 1; // 1-3
    case 'house': return Math.floor(Math.random() * 4) + 2;     // 2-5
    case 'penthouse': return Math.floor(Math.random() * 4) + 3; // 3-6
    case 'villa': return Math.floor(Math.random() * 5) + 4;     // 4-8
    case 'loft': return Math.floor(Math.random() * 2) + 1;      // 1-2
    default: return Math.floor(Math.random() * 3) + 1;
  }
}

function getRandomAmenities() {
  const amenitiesList = ['Pool', 'Gym', 'Parking', 'Security', 'Concierge', 'Garden', 'Balcony', 'Fireplace', 'Smart Home', 'Wine Cellar'];
  const shuffled = [...amenitiesList];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const count = Math.floor(Math.random() * 4) + 3; // 3-6 items
  return shuffled.slice(0, count).join(', ');
}

// ==================== PROPERTIES DATA (exactly from your PHP) ====================
const baseProperties = [
  // Alabama
  {
    title: 'Southern Comfort Estate',
    description: 'Beautiful southern estate with modern amenities and classic charm.',
    location: 'Birmingham, Alabama',
    city: 'Birmingham',
    state: 'Alabama',
    country: 'USA',
    price: 3200.00,
    image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1000&auto=format&fit=crop'
  },
  // Alaska
  {
    title: 'Wilderness Retreat',
    description: 'Secluded cabin with breathtaking mountain views and modern comforts.',
    location: 'Anchorage, Alaska',
    city: 'Anchorage',
    state: 'Alaska',
    country: 'USA',
    price: 2800.00,
    image_url: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?q=80&w=1000&auto=format&fit=crop'
  },
  // Arizona
  {
    title: 'Desert Modern Villa',
    description: 'Stunning modern villa with pool and panoramic desert views.',
    location: 'Phoenix, Arizona',
    city: 'Phoenix',
    state: 'Arizona',
    country: 'USA',
    price: 4500.00,
    image_url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1000&auto=format&fit=crop'
  },
  // Arkansas
  {
    title: 'Ozark Mountain Cabin',
    description: 'Charming cabin nestled in the Ozark Mountains with river access.',
    location: 'Fayetteville, Arkansas',
    city: 'Fayetteville',
    state: 'Arkansas',
    country: 'USA',
    price: 2200.00,
    image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop'
  },
  // California - Multiple
  {
    title: 'Malibu Oceanfront Villa',
    description: 'Luxury villa with direct beach access and infinity pool.',
    location: 'Malibu, California',
    city: 'Malibu',
    state: 'California',
    country: 'USA',
    price: 15000.00,
    image_url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1000&auto=format&fit=crop'
  },
  {
    title: 'San Francisco Loft',
    description: 'Modern loft in the heart of San Francisco with bay views.',
    location: 'San Francisco, California',
    city: 'San Francisco',
    state: 'California',
    country: 'USA',
    price: 6800.00,
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop'
  },
  {
    title: 'Los Angeles Penthouse',
    description: 'Luxury penthouse with panoramic city views and rooftop terrace.',
    location: 'Los Angeles, California',
    city: 'Los Angeles',
    state: 'California',
    country: 'USA',
    price: 12500.00,
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop'
  },
  // Colorado
  {
    title: 'Aspen Ski Chalet',
    description: 'Luxury ski-in/ski-out chalet with mountain views.',
    location: 'Aspen, Colorado',
    city: 'Aspen',
    state: 'Colorado',
    country: 'USA',
    price: 12500.00,
    image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000&auto=format&fit=crop'
  },
  {
    title: 'Denver Modern Townhouse',
    description: 'Contemporary townhouse in downtown Denver with mountain views.',
    location: 'Denver, Colorado',
    city: 'Denver',
    state: 'Colorado',
    country: 'USA',
    price: 4200.00,
    image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop'
  },
  // Connecticut
  {
    title: 'New England Classic',
    description: 'Historic New England home with modern updates and large yard.',
    location: 'Hartford, Connecticut',
    city: 'Hartford',
    state: 'Connecticut',
    country: 'USA',
    price: 3800.00,
    image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1000&auto=format&fit=crop'
  },
  // Delaware
  {
    title: 'Coastal Retreat',
    description: 'Beautiful beach house with ocean views and modern amenities.',
    location: 'Rehoboth Beach, Delaware',
    city: 'Rehoboth Beach',
    state: 'Delaware',
    country: 'USA',
    price: 3500.00,
    image_url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop'
  },
  // Florida
  {
    title: 'Miami Beach Condo',
    description: 'Luxury beachfront condo with pool and ocean views.',
    location: 'Miami, Florida',
    city: 'Miami',
    state: 'Florida',
    country: 'USA',
    price: 5800.00,
    image_url: 'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?q=80&w=1000&auto=format&fit=crop'
  },
  {
    title: 'Orlando Family Home',
    description: 'Spacious family home near attractions with pool.',
    location: 'Orlando, Florida',
    city: 'Orlando',
    state: 'Florida',
    country: 'USA',
    price: 3200.00,
    image_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1000&auto=format&fit=crop'
  },
  // Georgia
  {
    title: 'Atlanta Modern Loft',
    description: 'Industrial loft in downtown Atlanta with high ceilings.',
    location: 'Atlanta, Georgia',
    city: 'Atlanta',
    state: 'Georgia',
    country: 'USA',
    price: 3800.00,
    image_url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1000&auto=format&fit=crop'
  },
  // Hawaii
  {
    title: 'Waikiki Beachfront',
    description: 'Luxury beachfront apartment with stunning ocean views.',
    location: 'Honolulu, Hawaii',
    city: 'Honolulu',
    state: 'Hawaii',
    country: 'USA',
    price: 8500.00,
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop'
  },
  // Idaho
  {
    title: 'Boise Mountain View',
    description: 'Modern home with mountain views and outdoor living space.',
    location: 'Boise, Idaho',
    city: 'Boise',
    state: 'Idaho',
    country: 'USA',
    price: 2800.00,
    image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop'
  },
  // Illinois
  {
    title: 'Chicago River View',
    description: 'Luxury apartment with stunning Chicago river views.',
    location: 'Chicago, Illinois',
    city: 'Chicago',
    state: 'Illinois',
    country: 'USA',
    price: 5200.00,
    image_url: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=1000&auto=format&fit=crop'
  },
  // Indiana
  {
    title: 'Indianapolis Modern Home',
    description: 'Contemporary home in desirable Indianapolis neighborhood.',
    location: 'Indianapolis, Indiana',
    city: 'Indianapolis',
    state: 'Indiana',
    country: 'USA',
    price: 2400.00,
    image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1000&auto=format&fit=crop'
  },
  // Iowa
  {
    title: 'Des Moines Family Home',
    description: 'Spacious family home with updated kitchen and large yard.',
    location: 'Des Moines, Iowa',
    city: 'Des Moines',
    state: 'Iowa',
    country: 'USA',
    price: 2100.00,
    image_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1000&auto=format&fit=crop'
  },
  // Kansas
  {
    title: 'Wichita Modern Ranch',
    description: 'Updated ranch-style home with open floor plan.',
    location: 'Wichita, Kansas',
    city: 'Wichita',
    state: 'Kansas',
    country: 'USA',
    price: 1900.00,
    image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop'
  },
  // Kentucky
  {
    title: 'Louisville Historic Home',
    description: 'Beautifully restored historic home in Louisville.',
    location: 'Louisville, Kentucky',
    city: 'Louisville',
    state: 'Kentucky',
    country: 'USA',
    price: 2700.00,
    image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1000&auto=format&fit=crop'
  },
  // Louisiana
  {
    title: 'New Orleans French Quarter',
    description: 'Charming apartment in the heart of French Quarter.',
    location: 'New Orleans, Louisiana',
    city: 'New Orleans',
    state: 'Louisiana',
    country: 'USA',
    price: 3200.00,
    image_url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop'
  },
  // Maine
  {
    title: 'Portland Coastal Cottage',
    description: 'Charming coastal cottage with ocean views.',
    location: 'Portland, Maine',
    city: 'Portland',
    state: 'Maine',
    country: 'USA',
    price: 2900.00,
    image_url: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?q=80&w=1000&auto=format&fit=crop'
  },
  // Maryland
  {
    title: 'Baltimore Harbor View',
    description: 'Modern condo with harbor views in Baltimore.',
    location: 'Baltimore, Maryland',
    city: 'Baltimore',
    state: 'Maryland',
    country: 'USA',
    price: 3400.00,
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop'
  },
  // Massachusetts
  {
    title: 'Boston Brownstone',
    description: 'Historic brownstone in Boston with modern updates.',
    location: 'Boston, Massachusetts',
    city: 'Boston',
    state: 'Massachusetts',
    country: 'USA',
    price: 6200.00,
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop'
  },
  // Michigan
  {
    title: 'Detroit Modern Loft',
    description: 'Industrial loft in revitalized Detroit neighborhood.',
    location: 'Detroit, Michigan',
    city: 'Detroit',
    state: 'Michigan',
    country: 'USA',
    price: 2300.00,
    image_url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1000&auto=format&fit=crop'
  },
  // Minnesota
  {
    title: 'Minneapolis Lakeside',
    description: 'Beautiful home on one of Minneapolis\' famous lakes.',
    location: 'Minneapolis, Minnesota',
    city: 'Minneapolis',
    state: 'Minnesota',
    country: 'USA',
    price: 3100.00,
    image_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1000&auto=format&fit=crop'
  },
  // Mississippi
  {
    title: 'Jackson Southern Home',
    description: 'Traditional southern home with modern kitchen.',
    location: 'Jackson, Mississippi',
    city: 'Jackson',
    state: 'Mississippi',
    country: 'USA',
    price: 2100.00,
    image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1000&auto=format&fit=crop'
  },
  // Missouri
  {
    title: 'St. Louis Historic Loft',
    description: 'Converted warehouse loft in downtown St. Louis.',
    location: 'St. Louis, Missouri',
    city: 'St. Louis',
    state: 'Missouri',
    country: 'USA',
    price: 2800.00,
    image_url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1000&auto=format&fit=crop'
  },
  {
    title: 'Kansas City Modern',
    description: 'Contemporary home in Kansas City with smart features.',
    location: 'Kansas City, Missouri',
    city: 'Kansas City',
    state: 'Missouri',
    country: 'USA',
    price: 2600.00,
    image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop'
  },
  // Montana
  {
    title: 'Big Sky Ranch',
    description: 'Spacious ranch with mountain views in Montana.',
    location: 'Bozeman, Montana',
    city: 'Bozeman',
    state: 'Montana',
    country: 'USA',
    price: 3500.00,
    image_url: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?q=80&w=1000&auto=format&fit=crop'
  },
  // Nebraska
  {
    title: 'Omaha Modern Home',
    description: 'Updated modern home in desirable Omaha neighborhood.',
    location: 'Omaha, Nebraska',
    city: 'Omaha',
    state: 'Nebraska',
    country: 'USA',
    price: 2200.00,
    image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop'
  },
  // Nevada
  {
    title: 'Las Vegas Luxury Condo',
    description: 'High-rise condo on the Las Vegas Strip with pool.',
    location: 'Las Vegas, Nevada',
    city: 'Las Vegas',
    state: 'Nevada',
    country: 'USA',
    price: 4500.00,
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop'
  },
  // New Hampshire
  {
    title: 'White Mountain Retreat',
    description: 'Cozy retreat in the White Mountains with views.',
    location: 'Concord, New Hampshire',
    city: 'Concord',
    state: 'New Hampshire',
    country: 'USA',
    price: 2700.00,
    image_url: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?q=80&w=1000&auto=format&fit=crop'
  },
  // New Jersey
  {
    title: 'Jersey City Waterfront',
    description: 'Luxury condo with NYC skyline views.',
    location: 'Jersey City, New Jersey',
    city: 'Jersey City',
    state: 'New Jersey',
    country: 'USA',
    price: 4800.00,
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop'
  },
  // New Mexico
  {
    title: 'Santa Fe Adobe',
    description: 'Traditional adobe home with modern Southwestern style.',
    location: 'Santa Fe, New Mexico',
    city: 'Santa Fe',
    state: 'New Mexico',
    country: 'USA',
    price: 3200.00,
    image_url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1000&auto=format&fit=crop'
  },
  // New York - Multiple
  {
    title: 'Manhattan Penthouse',
    description: 'Luxury penthouse with Central Park views.',
    location: 'Manhattan, New York',
    city: 'New York',
    state: 'New York',
    country: 'USA',
    price: 18500.00,
    image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop'
  },
  {
    title: 'Brooklyn Brownstone',
    description: 'Renovated brownstone in trendy Brooklyn neighborhood.',
    location: 'Brooklyn, New York',
    city: 'New York',
    state: 'New York',
    country: 'USA',
    price: 6800.00,
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop'
  },
  {
    title: 'Upstate NY Estate',
    description: 'Spacious estate in upstate New York with acreage.',
    location: 'Albany, New York',
    city: 'Albany',
    state: 'New York',
    country: 'USA',
    price: 4200.00,
    image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1000&auto=format&fit=crop'
  },
  // North Carolina
  {
    title: 'Charlotte Modern Home',
    description: 'Contemporary home in Charlotte with smart features.',
    location: 'Charlotte, North Carolina',
    city: 'Charlotte',
    state: 'North Carolina',
    country: 'USA',
    price: 2900.00,
    image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop'
  },
  // North Dakota
  {
    title: 'Fargo Updated Home',
    description: 'Recently updated home in Fargo with modern amenities.',
    location: 'Fargo, North Dakota',
    city: 'Fargo',
    state: 'North Dakota',
    country: 'USA',
    price: 1900.00,
    image_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1000&auto=format&fit=crop'
  },
  // Ohio
  {
    title: 'Columbus Contemporary',
    description: 'Modern home in Columbus with open floor plan.',
    location: 'Columbus, Ohio',
    city: 'Columbus',
    state: 'Ohio',
    country: 'USA',
    price: 2400.00,
    image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop'
  },
  // Oklahoma
  {
    title: 'Oklahoma City Ranch',
    description: 'Updated ranch-style home with pool in OKC.',
    location: 'Oklahoma City, Oklahoma',
    city: 'Oklahoma City',
    state: 'Oklahoma',
    country: 'USA',
    price: 2100.00,
    image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1000&auto=format&fit=crop'
  },
  // Oregon
  {
    title: 'Portland Modern Loft',
    description: 'Industrial loft in Portland\'s Pearl District.',
    location: 'Portland, Oregon',
    city: 'Portland',
    state: 'Oregon',
    country: 'USA',
    price: 3200.00,
    image_url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1000&auto=format&fit=crop'
  },
  // Pennsylvania
  {
    title: 'Philadelphia Rowhouse',
    description: 'Historic rowhouse in Philadelphia with modern updates.',
    location: 'Philadelphia, Pennsylvania',
    city: 'Philadelphia',
    state: 'Pennsylvania',
    country: 'USA',
    price: 3500.00,
    image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1000&auto=format&fit=crop'
  },
  // Rhode Island
  {
    title: 'Newport Waterfront',
    description: 'Beautiful waterfront home in historic Newport.',
    location: 'Newport, Rhode Island',
    city: 'Newport',
    state: 'Rhode Island',
    country: 'USA',
    price: 5200.00,
    image_url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop'
  },
  // South Carolina
  {
    title: 'Charleston Historic Home',
    description: 'Beautifully preserved historic home in Charleston.',
    location: 'Charleston, South Carolina',
    city: 'Charleston',
    state: 'South Carolina',
    country: 'USA',
    price: 3800.00,
    image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1000&auto=format&fit=crop'
  },
  // South Dakota
  {
    title: 'Black Hills Cabin',
    description: 'Rustic cabin in the Black Hills with modern amenities.',
    location: 'Rapid City, South Dakota',
    city: 'Rapid City',
    state: 'South Dakota',
    country: 'USA',
    price: 2200.00,
    image_url: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?q=80&w=1000&auto=format&fit=crop'
  },
  // Tennessee
  {
    title: 'Nashville Music Row',
    description: 'Modern condo in Nashville\'s famous Music Row.',
    location: 'Nashville, Tennessee',
    city: 'Nashville',
    state: 'Tennessee',
    country: 'USA',
    price: 3200.00,
    image_url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1000&auto=format&fit=crop'
  },
  // Texas - Multiple
  {
    title: 'Austin Modern Home',
    description: 'Contemporary home in Austin with pool and yard.',
    location: 'Austin, Texas',
    city: 'Austin',
    state: 'Texas',
    country: 'USA',
    price: 4200.00,
    image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop'
  },
  {
    title: 'Dallas Luxury Condo',
    description: 'High-rise luxury condo in downtown Dallas.',
    location: 'Dallas, Texas',
    city: 'Dallas',
    state: 'Texas',
    country: 'USA',
    price: 3800.00,
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop'
  },
  {
    title: 'Houston Spacious Home',
    description: 'Large family home in Houston with updated kitchen.',
    location: 'Houston, Texas',
    city: 'Houston',
    state: 'Texas',
    country: 'USA',
    price: 3500.00,
    image_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1000&auto=format&fit=crop'
  },
  // Utah
  {
    title: 'Salt Lake City Modern',
    description: 'Contemporary home with mountain views in SLC.',
    location: 'Salt Lake City, Utah',
    city: 'Salt Lake City',
    state: 'Utah',
    country: 'USA',
    price: 3100.00,
    image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop'
  },
  // Vermont
  {
    title: 'Burlington Lake View',
    description: 'Charming home with Lake Champlain views.',
    location: 'Burlington, Vermont',
    city: 'Burlington',
    state: 'Vermont',
    country: 'USA',
    price: 2900.00,
    image_url: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?q=80&w=1000&auto=format&fit=crop'
  },
  // Virginia
  {
    title: 'Arlington Modern Condo',
    description: 'Luxury condo in Arlington with DC views.',
    location: 'Arlington, Virginia',
    city: 'Arlington',
    state: 'Virginia',
    country: 'USA',
    price: 4200.00,
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop'
  },
  // Washington
  {
    title: 'Seattle Waterfront',
    description: 'Modern condo with Puget Sound views.',
    location: 'Seattle, Washington',
    city: 'Seattle',
    state: 'Washington',
    country: 'USA',
    price: 4800.00,
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop'
  },
  // West Virginia
  {
    title: 'Charleston Mountain Home',
    description: 'Home with mountain views in West Virginia.',
    location: 'Charleston, West Virginia',
    city: 'Charleston',
    state: 'West Virginia',
    country: 'USA',
    price: 2100.00,
    image_url: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?q=80&w=1000&auto=format&fit=crop'
  },
  // Wisconsin
  {
    title: 'Milwaukee Lakefront',
    description: 'Modern condo on Lake Michigan in Milwaukee.',
    location: 'Milwaukee, Wisconsin',
    city: 'Milwaukee',
    state: 'Wisconsin',
    country: 'USA',
    price: 2700.00,
    image_url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop'
  },
  // Wyoming
  {
    title: 'Jackson Hole Estate',
    description: 'Luxury estate in Jackson Hole with mountain views.',
    location: 'Jackson, Wyoming',
    city: 'Jackson',
    state: 'Wyoming',
    country: 'USA',
    price: 6800.00,
    image_url: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?q=80&w=1000&auto=format&fit=crop'
  }
];

// ==================== MAIN SEED FUNCTION ====================
async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing properties (optional – comment out if you want to keep old data)
    await Property.deleteMany({});
    console.log('🗑️ Cleared existing properties');

    // Transform and insert
    const enrichedProperties = baseProperties.map(prop => {
      const propertyType = getRandomPropertyType();
      const beds = getRandomBeds(propertyType);
      return {
        title: prop.title,
        description: prop.description,
        price: prop.price,
        location: prop.location,
        city: prop.city,
        state: prop.state,
        country: prop.country,
        image: prop.image_url,
        type: propertyType,
        tag: getRandomTag(),
        sqft: Math.floor(Math.random() * (5000 - 800 + 1) + 800),
        beds: beds,
        baths: Math.max(1, beds - Math.floor(Math.random() * 2)),
        amenities: getRandomAmenities(),
        rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
        featured: Math.random() > 0.5,
        status: 'available',
        createdAt: new Date()
      };
    });

    await Property.insertMany(enrichedProperties);
    console.log(`✅ Seeded ${enrichedProperties.length} properties`);
    
    // Show stats
    const statesCount = await Property.distinct('state');
    console.log(`📊 States covered: ${statesCount.length}`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seedDatabase();