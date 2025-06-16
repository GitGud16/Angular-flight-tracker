# 🛩️ Angular Flight Tracker

A flight tracking application built with Angular and Node.js, featuring live flight data from OpenSky Network with advanced filtering, pagination, and comprehensive statistics.


![Angular](https://img.shields.io/badge/Angular-17.3-red)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple)

## 📚 Documentation

This repository contains detailed documentation for each component:

- **[Frontend README](flight-tracker/README.md)** - Angular development guide, component details, NgRx state management, and frontend-specific configuration
- **[Backend README](backend/README.md)** - API documentation, server setup, authentication, and backend development guide
- **[Main README](README.md)** - Project overview, quick start guide, and general information (this file)

## ✨ Features

### 🎯 **Core Functionality**
- **Live Flight Data**: Near real-time flight tracking using OpenSky Network API
- **Regional Filtering**: Filter flights by geographic regions (Saudi Arabia, Europe, North America, etc.)
- **Interactive Map**: Leaflet-powered map with flight markers and directional indicators
- **Pagination**: Efficient data loading with server-side pagination (50 flights per page)
- **Flight Details**: Comprehensive flight information including altitude, speed, and coordinates

### 📊 **Analytics**
- **Flight Statistics Dashboard**: Comprehensive analytics with visual progress bars
- **Performance Metrics**: Altitude distribution, speed analysis, and flight directions
- **Key Insights**: Analysis of flight patterns and regional activity
- **Flight Summary**: Activity overview with traffic flow analysis

### 🎨 **User Experience**
- **Responsive Design**: Adaptive layout with collapsible burger menu navigation for mobile
- **Dark/Light Theme**: Toggle between themes with smooth transitions and emoji indicators
- **Smart Caching**: Optimized performance with 5-minute server cache and 2-minute client cache
- **Loading States**: Smooth loading indicators

### 🔧 **Technical Features**
- **OAuth2 Authentication**: Secure token management with OpenSky Network
- **NgRx State Management**: Predictable state management with Redux pattern
- **Server-Side Rendering (SSR)**: Angular Universal for better SEO and performance
- **TypeScript**: Full type safety throughout the application

## 🏗️ Architecture

```
Angular-Flight-Tracker/
├── flight-tracker/          # Angular Frontend Application
│   ├── src/app/             # Angular components, services, store
│   ├── README.md           # Frontend development guide
│   └── ...
├── backend/                 # Node.js Express API Server
│   ├── server.js           # Main server file
│   ├── README.md           # Backend API documentation
│   ├── .env                # Environment configuration
│   └── ...
└── README.md               # Project overview (this file)
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **OpenSky Network Account** (for API credentials)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Angular-Flight-Tracker.git
cd Angular-Flight-Tracker
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file with your OpenSky credentials
cp .env.example .env
# Edit .env with your OpenSky client ID and secret

npm start
```

### 3. Frontend Setup
In a new terminal:
```bash
cd flight-tracker
npm install
ng serve
```

### 4. Access the Application
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 🔑 Environment Configuration

Create a `.env` file in the backend directory with your OpenSky Network credentials:

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

### Getting OpenSky Credentials
1. Visit [OpenSky Network](https://opensky-network.org/my-opensky/account)
2. Create an account and log in
3. Go to "Account" → "API Client" → "Reset Credential"
4. Download the JSON file with your credentials
5. Copy `client_id` and `client_secret` to your `.env` file

## 📡 API Overview

The backend provides these main endpoints (see [Backend README](backend/README.md) for detailed API documentation):

| Endpoint | Description |
|----------|-------------|
| `/api/flights` | Get paginated flights with regional filtering |
| `/api/statistics` | Get comprehensive flight statistics |
| `/api/regions` | Get available regions for filtering |
| `/health` | Health check and server status |

## 🛠️ Development

For detailed development information, see the respective README files:
- **Frontend Development**: [flight-tracker/README.md](flight-tracker/README.md)
- **Backend Development**: [backend/README.md](backend/README.md)

### Key Technologies
- **Frontend**: Angular 17, NgRx, Bootstrap 5, Leaflet
- **Backend**: Node.js, Express, OAuth2
- **Styling**: SCSS, CSS Variables, Responsive Design
- **State Management**: NgRx with Effects
- **HTTP Client**: Angular HttpClient with caching
- **Maps**: Leaflet with OpenStreetMap tiles

### Development Commands
```bash
# Frontend development
cd flight-tracker
ng serve                    # Start dev server
ng build                    # Build for production
ng test                     # Run unit tests if they exist

# Backend development
cd backend
npm run dev                 # Start with nodemon
npm start                   # Start production server
```

## 🔧 Performance Optimizations

### Caching Strategy
- **Token Caching**: 25-minute cache (30min - 5min buffer)
- **Flight Data**: 5-minute server cache + 2-minute client cache
- **Statistics**: 5-minute cache for analytics data

### Pagination & Filtering
- **Server-side Pagination**: 50 flights per page (easily configurable)
- **Regional Filtering**: Reduces data transfer by 90%+
- **Lazy Loading**: Components load data on demand

### Frontend Optimizations
- **TrackBy Functions**: Efficient ngFor rendering
- **OnPush Change Detection**: Optimized component updates
- **Service Workers**: Caching for offline capability (SSR ready)

## 🌍 Regional Coverage

The application supports filtering flights by these regions:
- **All Regions**: Global flight data
- **Saudi Arabia**: 16°N to 32°N, 34°E to 56°E
- **Europe**: 35°N to 70°N, -25°E to 40°E
- **North America**: 15°N to 70°N, -170°E to -50°E
- **South America**: -60°N to 15°N, -90°E to -30°E
- **Asia**: 0°N to 70°N, 60°E to 180°E
- **Africa**: -40°N to 35°N, -20°E to 50°E
- **Oceania**: -50°N to 0°N, 110°E to 180°E

## 🔒 Security Features

- **Environment Variables**: Sensitive data stored securely
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Server-side request validation
- **Error Handling**: Graceful error responses
- **Token Management**: Automatic refresh with buffer time

## 📈 Monitoring & Health

### Health Check Endpoint
```json
GET /health
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

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenSky Network** for providing free flight data API
- **Angular Team** for the excellent framework
- **Leaflet** for the interactive mapping library
- **Bootstrap** for the responsive UI components

---

**Built with ❤️ by Ahmed Alsaggaf using Angular and Node.js** 