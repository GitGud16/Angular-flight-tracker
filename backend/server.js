require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT;

// Enable CORS for your Angular app
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json());

// OpenSky API configuration from environment variables
const OPENSKY_CONFIG = {
  tokenUrl: process.env.OPENSKY_TOKEN_URL,
  apiUrl: process.env.OPENSKY_API_URL ,
  clientId: process.env.OPENSKY_CLIENT_ID,
  clientSecret: process.env.OPENSKY_CLIENT_SECRET
};

// Cache configuration from environment variables
const CACHE_CONFIG = {
  tokenBufferMinutes: parseInt(process.env.TOKEN_CACHE_BUFFER_MINUTES),
  flightsCacheMinutes: parseInt(process.env.FLIGHTS_CACHE_MINUTES)
};

// Validate required environment variables
if (!OPENSKY_CONFIG.clientId || !OPENSKY_CONFIG.clientSecret) {
  console.error('❌ Missing required environment variables:');
  console.error('   OPENSKY_CLIENT_ID and OPENSKY_CLIENT_SECRET must be set');
  console.error('   Please create a .env file with your OpenSky credentials');
  process.exit(1);
}

console.log('🔧 Configuration loaded:');
console.log(`   Port: ${PORT}`);
console.log(`   CORS Origin: ${process.env.CORS_ORIGIN }`);
console.log(`   Client ID: ${OPENSKY_CONFIG.clientId}`);
console.log(`   Token Cache Buffer: ${CACHE_CONFIG.tokenBufferMinutes} minutes`);
console.log(`   Flights Cache: ${CACHE_CONFIG.flightsCacheMinutes} minutes`);

// Token cache
let tokenCache = {
  token: null,
  expiration: 0
};

// Flights cache
let flightsCache = {
  data: null,
  expiration: 0
};

// Get access token
async function getAccessToken() {
  // Check if we have a valid cached token
  if (tokenCache.token && Date.now() < tokenCache.expiration) {
    console.log('🔄 Using cached token');
    return tokenCache.token;
  }

  console.log('🔑 Requesting new access token...');
  
  const body = new URLSearchParams();
  body.append('grant_type', 'client_credentials');
  body.append('client_id', OPENSKY_CONFIG.clientId);
  body.append('client_secret', OPENSKY_CONFIG.clientSecret);

  try {
    const response = await fetch(OPENSKY_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Cache the token (subtract buffer minutes for safety)
    const bufferMs = CACHE_CONFIG.tokenBufferMinutes * 60 * 1000;
    tokenCache.token = data.access_token;
    tokenCache.expiration = Date.now() + (data.expires_in * 1000) - bufferMs;
    
    console.log('✅ Token received and cached');
    return data.access_token;
  } catch (error) {
    console.error('❌ Token request failed:', error);
    throw error;
  }
}

// Get flights data
async function getFlightsData() {
  // Check if we have valid cached flights data
  if (flightsCache.data && Date.now() < flightsCache.expiration) {
    console.log('📦 Using cached flights data');
    return flightsCache.data;
  }

  console.log('🛩️ Fetching fresh flights data...');
  
  try {
    const token = await getAccessToken();
    
    const response = await fetch(OPENSKY_CONFIG.apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Flights request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Process the data (same logic as your Angular service)
    const flights = data.states.map(state => ({
      id: state[0],
      callsign: state[1]?.trim() || 'N/A',
      origin: state[2] || 'N/A',
      destination: 'N/A',
      time_position: state[3],
      last_contact: state[4],
      longitude: state[5],
      latitude: state[6],
      baro_altitude: state[7],
      on_ground: state[8],
      velocity: state[9],
      true_track: state[10],
      vertical_rate: state[11],
      sensors: state[12],
      altitude: state[13],
      squawk: state[14],
      spi: state[15],
      position_source: state[16],
      category: state[17]
    }));

    // Cache the flights data
    const cacheMs = CACHE_CONFIG.flightsCacheMinutes * 60 * 1000;
    flightsCache.data = flights;
    flightsCache.expiration = Date.now() + cacheMs;
    
    console.log(`✅ Fetched and cached ${flights.length} flights`);
    return flights;
  } catch (error) {
    console.error('❌ Flights request failed:', error);
    throw error;
  }
}

// Helper function to check if flight is in a specific region
function isFlightInRegion(flight, region) {
  const lat = flight.latitude;
  const lon = flight.longitude;

  // Skip flights with invalid coordinates
  if (!lat || !lon || lat === null || lon === null) {
    return false;
  }

  switch (region.toLowerCase()) {
    case 'saudi arabia':
      // Saudi Arabia coordinates: roughly 16°N to 32°N, 34°E to 56°E
      return lat >= 16 && lat <= 32 && lon >= 34 && lon <= 56;
    case 'europe':
      return lat > 35 && lat < 70 && lon > -25 && lon < 40;
    case 'north america':
      return lat > 15 && lat < 70 && lon > -170 && lon < -50;
    case 'south america':
      return lat > -60 && lat < 15 && lon > -90 && lon < -30;
    case 'asia':
      return lat > 0 && lat < 70 && lon > 60 && lon < 180;
    case 'africa':
      return lat > -40 && lat < 35 && lon > -20 && lon < 50;
    case 'oceania':
      return lat > -50 && lat < 0 && lon > 110 && lon < 180;
    case 'all':
      return true;
    default:
      return false;
  }
}

// API Routes
app.get('/api/flights', async (req, res) => {
  try {
    const flights = await getFlightsData();
    
    // Get query parameters
    const region = req.query.region || 'all';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Changed from 1000 to 50 for better performance
    
    console.log(`📡 API Request: region=${region}, page=${page}, limit=${limit}`);
    console.log(`🔍 Total flights from API: ${flights.length}`);
    
    // Filter by region first
    let filteredFlights = flights;
    if (region.toLowerCase() !== 'all') {
      filteredFlights = flights.filter(flight => isFlightInRegion(flight, region));
      console.log(`🌍 Filtered to ${filteredFlights.length} flights in ${region}`);
      
      // Debug: Show first few flights that match Saudi Arabia
      if (region.toLowerCase() === 'saudi arabia' && filteredFlights.length > 0) {
        console.log(`🔍 First few Saudi Arabia flights:`, filteredFlights.slice(0, 3).map(f => ({
          id: f.id,
          callsign: f.callsign,
          lat: f.latitude,
          lon: f.longitude
        })));
      }
    }
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFlights = filteredFlights.slice(startIndex, endIndex);
    
    // Calculate pagination info
    const totalFlights = filteredFlights.length;
    const totalPages = Math.ceil(totalFlights / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    console.log(`📄 Pagination: ${paginatedFlights.length} flights (page ${page}/${totalPages})`);
    console.log(`📊 startIndex: ${startIndex}, endIndex: ${endIndex}, totalFlights: ${totalFlights}`);
    
    res.json({
      success: true,
      data: paginatedFlights,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalFlights: totalFlights,
        flightsPerPage: limit,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage
      },
      filters: {
        region: region
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get available regions endpoint
app.get('/api/regions', (req, res) => {
  res.json({
    success: true,
    data: [
      'All',
      'Saudi Arabia', 
      'Europe', 
      'North America', 
      'South America', 
      'Asia', 
      'Africa', 
      'Oceania'
    ]
  });
});

// Statistics endpoint - calculates stats on ALL flights in region
app.get('/api/statistics', async (req, res) => {
  try {
    const flights = await getFlightsData();
    const region = req.query.region || 'all';
    
    console.log(`📊 Statistics Request: region=${region}`);
    console.log(`🔍 Total flights from API: ${flights.length}`);
    
    // Filter by region
    let filteredFlights = flights;
    if (region.toLowerCase() !== 'all') {
      filteredFlights = flights.filter(flight => isFlightInRegion(flight, region));
      console.log(`🌍 Filtered to ${filteredFlights.length} flights in ${region}`);
    }
    
    // Calculate comprehensive statistics
    const stats = calculateFlightStatistics(filteredFlights, region);
    
    console.log(`📈 Statistics calculated for ${stats.totalFlights} flights in ${region}`);
    
    res.json({
      success: true,
      data: stats,
      region: region,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Statistics API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to calculate comprehensive flight statistics
function calculateFlightStatistics(flights, region) {
  if (!flights || flights.length === 0) {
    return {
      totalFlights: 0,
      flyingFlights: 0,
      groundedFlights: 0,
      averageAltitude: 0,
      averageSpeed: 0,
      highestAltitude: 0,
      fastestSpeed: 0,
      altitudeRanges: {},
      speedRanges: {},
      aircraftCategories: {},
      flightDirections: {},
      region: region
    };
  }

  const validFlights = flights.filter(f => f.latitude && f.longitude);
  const flyingFlights = validFlights.filter(f => !f.on_ground);
  const groundedFlights = validFlights.filter(f => f.on_ground);

  // Basic statistics
  const totalFlights = validFlights.length;
  const averageAltitude = calculateAverage(flyingFlights.map(f => f.altitude || 0));
  const averageSpeed = calculateAverage(validFlights.map(f => f.velocity || 0));
  const highestAltitude = Math.max(...validFlights.map(f => f.altitude || 0));
  const fastestSpeed = Math.max(...validFlights.map(f => f.velocity || 0));

  // Altitude ranges (in meters)
  const altitudeRanges = {
    'Ground (0m)': groundedFlights.length,
    'Low (1-3000m)': flyingFlights.filter(f => (f.altitude || 0) > 0 && (f.altitude || 0) <= 3000).length,
    'Medium (3000-10000m)': flyingFlights.filter(f => (f.altitude || 0) > 3000 && (f.altitude || 0) <= 10000).length,
    'High (10000m+)': flyingFlights.filter(f => (f.altitude || 0) > 10000).length
  };

  // Speed ranges (in m/s)
  const speedRanges = {
    'Stationary (0 m/s)': validFlights.filter(f => (f.velocity || 0) === 0).length,
    'Slow (1-50 m/s)': validFlights.filter(f => (f.velocity || 0) > 0 && (f.velocity || 0) <= 50).length,
    'Medium (50-150 m/s)': validFlights.filter(f => (f.velocity || 0) > 50 && (f.velocity || 0) <= 150).length,
    'Fast (150+ m/s)': validFlights.filter(f => (f.velocity || 0) > 150).length
  };

  // Aircraft categories
  const aircraftCategories = {
    'Unknown': validFlights.filter(f => !f.category || f.category === 0).length,
    'Light': validFlights.filter(f => f.category === 1).length,
    'Small': validFlights.filter(f => f.category === 2).length,
    'Large': validFlights.filter(f => f.category === 3).length,
    'Heavy': validFlights.filter(f => f.category === 4).length,
    'Military': validFlights.filter(f => f.category === 5).length,
    'Other': validFlights.filter(f => f.category && f.category > 5).length
  };

  // Flight directions (based on true_track)
  const flightDirections = {
    'North (315-45°)': validFlights.filter(f => isInDirection(f.true_track, 315, 45)).length,
    'East (45-135°)': validFlights.filter(f => isInDirection(f.true_track, 45, 135)).length,
    'South (135-225°)': validFlights.filter(f => isInDirection(f.true_track, 135, 225)).length,
    'West (225-315°)': validFlights.filter(f => isInDirection(f.true_track, 225, 315)).length,
    'Unknown': validFlights.filter(f => !f.true_track && f.true_track !== 0).length
  };

  return {
    totalFlights,
    flyingFlights: flyingFlights.length,
    groundedFlights: groundedFlights.length,
    averageAltitude: Math.round(averageAltitude),
    averageSpeed: Math.round(averageSpeed),
    highestAltitude,
    fastestSpeed,
    altitudeRanges,
    speedRanges,
    aircraftCategories,
    flightDirections,
    region: region
  };
}

// Helper function to calculate average
function calculateAverage(values) {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

// Helper function to check direction
function isInDirection(track, start, end) {
  if (!track && track !== 0) return false;
  
  if (start > end) {
    // Handle wrap-around (e.g., North: 315-45°)
    return track >= start || track <= end;
  } else {
    return track >= start && track <= end;
  }
}

// Get single flight
app.get('/api/flights/:id', async (req, res) => {
  try {
    const flights = await getFlightsData();
    const flight = flights.find(f => f.id === req.params.id);
    
    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }
    
    res.json({
      success: true,
      data: flight
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    tokenCached: !!tokenCache.token,
    flightsCached: !!flightsCache.data,
    config: {
      port: PORT,
      corsOrigin: process.env.CORS_ORIGIN,
      tokenCacheBuffer: CACHE_CONFIG.tokenBufferMinutes,
      flightsCache: CACHE_CONFIG.flightsCacheMinutes
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Flight Tracker Backend running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   GET /api/flights - Get all flights`);
  console.log(`   GET /api/flights/:id - Get single flight`);
  console.log(`   GET /health - Health check`);
}); 