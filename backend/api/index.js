require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Enable CORS for your Angular app
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json());

// OpenSky API configuration from environment variables
const OPENSKY_CONFIG = {
  tokenUrl: process.env.OPENSKY_TOKEN_URL || 'https://opensky-network.org/api/auth/token',
  apiUrl: process.env.OPENSKY_API_URL || 'https://opensky-network.org/api/states/all',
  clientId: process.env.OPENSKY_CLIENT_ID,
  clientSecret: process.env.OPENSKY_CLIENT_SECRET
};

// Cache configuration from environment variables
const CACHE_CONFIG = {
  tokenBufferMinutes: parseInt(process.env.TOKEN_CACHE_BUFFER_MINUTES) || 5,
  flightsCacheMinutes: parseInt(process.env.FLIGHTS_CACHE_MINUTES) || 5
};

// Token cache (Note: This will reset on each serverless invocation)
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

  if (!lat || !lon || lat === null || lon === null) {
    return false;
  }

  switch (region.toLowerCase()) {
    case 'saudi arabia':
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

// Helper functions for statistics
function calculateAverage(values) {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

function isInDirection(track, start, end) {
  if (!track && track !== 0) return false;
  
  if (start > end) {
    return track >= start || track <= end;
  } else {
    return track >= start && track <= end;
  }
}

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

  const totalFlights = validFlights.length;
  const averageAltitude = calculateAverage(flyingFlights.map(f => f.altitude || 0));
  const averageSpeed = calculateAverage(validFlights.map(f => f.velocity || 0));
  const highestAltitude = Math.max(...validFlights.map(f => f.altitude || 0));
  const fastestSpeed = Math.max(...validFlights.map(f => f.velocity || 0));

  const altitudeRanges = {
    'Ground (0m)': groundedFlights.length,
    'Low (1-3000m)': flyingFlights.filter(f => (f.altitude || 0) > 0 && (f.altitude || 0) <= 3000).length,
    'Medium (3000-10000m)': flyingFlights.filter(f => (f.altitude || 0) > 3000 && (f.altitude || 0) <= 10000).length,
    'High (10000m+)': flyingFlights.filter(f => (f.altitude || 0) > 10000).length
  };

  const speedRanges = {
    'Stationary (0 m/s)': validFlights.filter(f => (f.velocity || 0) === 0).length,
    'Slow (1-50 m/s)': validFlights.filter(f => (f.velocity || 0) > 0 && (f.velocity || 0) <= 50).length,
    'Medium (50-150 m/s)': validFlights.filter(f => (f.velocity || 0) > 50 && (f.velocity || 0) <= 150).length,
    'Fast (150+ m/s)': validFlights.filter(f => (f.velocity || 0) > 150).length
  };

  const aircraftCategories = {
    'Unknown': validFlights.filter(f => !f.category || f.category === 0).length,
    'Light': validFlights.filter(f => f.category === 1).length,
    'Small': validFlights.filter(f => f.category === 2).length,
    'Large': validFlights.filter(f => f.category === 3).length,
    'Heavy': validFlights.filter(f => f.category === 4).length,
    'Military': validFlights.filter(f => f.category === 5).length,
    'Other': validFlights.filter(f => f.category && f.category > 5).length
  };

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

// API Routes
app.get('/api/flights', async (req, res) => {
  try {
    const flights = await getFlightsData();
    
    const region = req.query.region || 'all';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    console.log(`📡 API Request: region=${region}, page=${page}, limit=${limit}`);
    
    let filteredFlights = flights;
    if (region.toLowerCase() !== 'all') {
      filteredFlights = flights.filter(flight => isFlightInRegion(flight, region));
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFlights = filteredFlights.slice(startIndex, endIndex);
    
    const totalFlights = filteredFlights.length;
    const totalPages = Math.ceil(totalFlights / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
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

app.get('/api/statistics', async (req, res) => {
  try {
    const flights = await getFlightsData();
    const region = req.query.region || 'all';
    
    let filteredFlights = flights;
    if (region.toLowerCase() !== 'all') {
      filteredFlights = flights.filter(flight => isFlightInRegion(flight, region));
    }
    
    const stats = calculateFlightStatistics(filteredFlights, region);
    
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

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    tokenCached: !!tokenCache.token,
    flightsCached: !!flightsCache.data,
    environment: 'Vercel Serverless',
    config: {
      corsOrigin: process.env.CORS_ORIGIN,
      tokenCacheBuffer: CACHE_CONFIG.tokenBufferMinutes,
      flightsCache: CACHE_CONFIG.flightsCacheMinutes
    }
  });
});

// Export the Express app
module.exports = app;