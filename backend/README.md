# 🛩️ Flight Tracker Backend API

Node.js Express server providing secure API endpoints for the Angular Flight Tracker application. Handles OpenSky Network OAuth2 authentication, flight data caching, regional filtering, and comprehensive analytics.

## 🎯 Purpose & Problem Solving

This backend server acts as a secure intermediary between the Angular frontend and the OpenSky Network API, solving several critical challenges:

### 🔐 **Authentication & Security**
- **Problem**: OpenSky Network requires OAuth2 client credentials that cannot be safely stored in frontend applications
- **Solution**: Server-side OAuth2 token management with automatic refresh, keeping credentials secure

### 🌐 **CORS & API Access**
- **Problem**: Direct browser requests to OpenSky Network API are blocked by CORS policies
- **Solution**: Backend proxy that handles API communication and enables CORS for the frontend

### ⚡ **Performance & Efficiency**
- **Problem**: Raw OpenSky API returns massive datasets (10k+ flights globally) causing slow load times
- **Solution**: Server-side regional filtering reduces data transfer by 90%+ and implements pagination (50 flights per page)

### 📊 **Data Processing & Analytics**
- **Problem**: OpenSky API returns raw flight arrays requiring complex client-side processing
- **Solution**: Server processes data into structured objects and calculates comprehensive statistics (altitude ranges, speed analysis, flight directions)

### 🏃‍♂️ **Caching & Rate Limiting**
- **Problem**: Multiple frontend requests would hit OpenSky API rate limits and cause unnecessary load
- **Solution**: Smart caching strategy (5-minute flight data cache, 25-minute token cache) minimizes API calls

### 🔧 **Environment Management**
- **Problem**: Different environments (dev/prod) need different configurations
- **Solution**: Environment-based configuration with secure credential management

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create environment file (see main README for credential setup)
copy .env.example .env  # Windows
# cp .env.example .env   # Unix/Linux

# Start development server
npm run dev

# Start production server
npm start
```

Server runs on `http://localhost:3000` by default.

## 🔧 Environment Setup

Create a `.env` file in the backend directory with the following variables. For detailed setup instructions and how to get OpenSky credentials, see the [main README](../README.md#environment-configuration).

```bash
# OpenSky Network API Configuration
OPENSKY_CLIENT_ID=your_client_id_here
OPENSKY_CLIENT_SECRET=your_client_secret_here
OPENSKY_TOKEN_URL=https://opensky-network.org/api/auth/token
OPENSKY_API_URL=https://opensky-network.org/api/states/all

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200

# Cache Configuration (in minutes)
TOKEN_CACHE_BUFFER_MINUTES=5
FLIGHTS_CACHE_MINUTES=5
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/flights` | Get paginated flights with regional filtering |
| GET | `/api/flights/:id` | Get specific flight details |
| GET | `/api/statistics` | Get flight statistics for a region |
| GET | `/api/regions` | Get available regions list |
| GET | `/health` | Health check and server status |

## 📖 API Documentation

### GET `/api/flights`

Get paginated flight data with optional regional filtering.

**Query Parameters:**
- `region` (string, optional): Filter by region. Default: `"all"`
- `page` (number, optional): Page number for pagination. Default: `1`  
- `limit` (number, optional): Flights per page. Default: `50`

**Example Requests:**
```bash
# Get all flights (first page)
GET /api/flights

# Get flights in Saudi Arabia, page 2
GET /api/flights?region=saudi%20arabia&page=2&limit=25

# Get flights in Europe
GET /api/flights?region=europe
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "callsign": "SVA123",
      "origin": "Saudi Arabia",
      "destination": "N/A",
      "time_position": 1703515200,
      "last_contact": 1703515200,
      "longitude": 46.6753,
      "latitude": 24.7136,
      "baro_altitude": 11000,
      "on_ground": false,
      "velocity": 250,
      "true_track": 45,
      "vertical_rate": 0,
      "altitude": 11000,
      "squawk": "1200",
      "category": 3
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalFlights": 234,
    "flightsPerPage": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters": {
    "region": "saudi arabia"
  },
  "timestamp": "2023-12-15T10:30:00.000Z"
}
```

### GET `/api/flights/:id`

Get detailed information for a specific flight.

**Parameters:**
- `id` (string): Flight identifier

**Example Request:**
```bash
GET /api/flights/abc123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "callsign": "SVA123",
    // ... full flight object
  }
}
```

### GET `/api/statistics`

Get comprehensive flight statistics for a region.

**Query Parameters:**
- `region` (string, optional): Calculate stats for specific region. Default: `"all"`

**Example Requests:**
```bash
# Global statistics
GET /api/statistics

# Saudi Arabia statistics  
GET /api/statistics?region=saudi%20arabia
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalFlights": 234,
    "flyingFlights": 198,
    "groundedFlights": 36,
    "averageAltitude": 9500,
    "averageSpeed": 180,
    "highestAltitude": 12500,
    "fastestSpeed": 320,
    "altitudeRanges": {
      "Ground (0m)": 36,
      "Low (1-3000m)": 12,
      "Medium (3000-10000m)": 89,
      "High (10000m+)": 97
    },
    "speedRanges": {
      "Stationary (0 m/s)": 36,
      "Slow (1-50 m/s)": 8,
      "Medium (50-150 m/s)": 45,
      "Fast (150+ m/s)": 145
    },
    "aircraftCategories": {
      "Unknown": 14,
      "Light": 23,
      "Small": 45,
      "Large": 89,
      "Heavy": 52,
      "Military": 8,
      "Other": 3
    },
    "flightDirections": {
      "North (315-45°)": 58,
      "East (45-135°)": 67,
      "South (135-225°)": 52,
      "West (225-315°)": 43,
      "Unknown": 14
    },
    "region": "saudi arabia"
  },
  "region": "saudi arabia",
  "timestamp": "2023-12-15T10:30:00.000Z"
}
```

### GET `/api/regions`

Get list of available regions for filtering.

**Response:**
```json
{
  "success": true,
  "data": [
    "All",
    "Saudi Arabia",
    "Europe", 
    "North America",
    "South America",
    "Asia",
    "Africa",
    "Oceania"
  ]
}
```

### GET `/health`

Health check endpoint with server status and configuration.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-12-15T10:30:00.000Z",
  "tokenCached": true,
  "flightsCached": true,
  "config": {
    "port": 3000,
    "corsOrigin": "http://localhost:4200",
    "tokenCacheBuffer": 5,
    "flightsCache": 5
  }
}
```

## 🌍 Regional Coverage

| Region | Coordinates |
|--------|-------------|
| Saudi Arabia | 16°N to 32°N, 34°E to 56°E |
| Europe | 35°N to 70°N, -25°E to 40°E |
| North America | 15°N to 70°N, -170°E to -50°E |
| South America | -60°N to 15°N, -90°E to -30°E |
| Asia | 0°N to 70°N, 60°E to 180°E |
| Africa | -40°N to 35°N, -20°E to 50°E |
| Oceania | -50°N to 0°N, 110°E to 180°E |

## ⚡ Performance & Caching

### Caching Strategy
- **OAuth2 Tokens**: 25-minute cache (30min - 5min buffer)
- **Flight Data**: 5-minute cache (configurable via `FLIGHTS_CACHE_MINUTES`)
- **Request-Driven**: Only refreshes when cache expires, no background processes

### Performance Features
- Server-side pagination (50 flights per page)
- Regional filtering reduces data transfer by 90%+
- Efficient in-memory caching
- Smart token refresh with buffer time

## 🔒 Security

- ✅ OAuth2 Client Credentials Flow
- ✅ Environment variables for sensitive data
- ✅ CORS protection with configurable origins
- ✅ Input validation and error handling
- ✅ No sensitive data in logs

## 🛠️ Development

### Available Scripts
```bash
npm start          # Production server
npm run dev        # Development with auto-restart (nodemon)
npm test           # Run tests (placeholder)
```

### Testing API Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Get flights
curl "http://localhost:3000/api/flights?region=saudi%20arabia&page=1&limit=10"

# Get statistics
curl "http://localhost:3000/api/statistics?region=europe"

# Get regions
curl http://localhost:3000/api/regions
```

### Dependencies
- `express` - Web framework
- `cors` - CORS middleware
- `node-fetch` - HTTP client for OpenSky API
- `dotenv` - Environment variable management
- `nodemon` - Development auto-restart (dev dependency)

## 🚨 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description",
  "timestamp": "2023-12-15T10:30:00.000Z"
}
```

Common HTTP status codes:
- `200` - Success
- `404` - Flight not found (for `/api/flights/:id`)
- `500` - Server error (API failures, invalid credentials, etc.)

---

**Built with Node.js and Express** 