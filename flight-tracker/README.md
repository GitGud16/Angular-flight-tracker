# 🛩️ Flight Tracker Frontend

Angular frontend application for the Flight Tracker project. This README focuses on frontend-specific development information. For project overview and setup instructions, see the [main README](../README.md).

## 🌐 Live Demo

🚀 **[View Live Application](https://angular-flight-tracker-zyt7.vercel.app/flights)**

Experience the full-featured flight tracking application with real-time flight data, interactive maps, and comprehensive analytics.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
ng serve

# Build for production
ng build
```

Navigate to `http://localhost:4200/`. The app will automatically reload when you change source files.

## 📁 Project Structure

```
src/app/
├── components/
│   ├── flight-list/         # Flight table with pagination
│   ├── flight-map/          # Leaflet map integration
│   ├── flight-statistics/   # Analytics dashboard
│   ├── flight-details/      # Flight detail modal
│   └── navbar/              # Navigation with theme toggle
├── services/
│   ├── flight.service.ts    # API communication
│   └── theme.service.ts     # Theme management
├── store/                   # NgRx state management
│   └── flight/
│       ├── flight.actions.ts
│       ├── flight.effects.ts
│       ├── flight.reducer.ts
│       └── flight.selectors.ts
├── models/
│   └── flight.model.ts      # TypeScript interfaces
└── styles/
    ├── _variables.scss      # SCSS variables
    ├── _themes.scss         # Theme definitions
    └── styles.scss          # Global styles
```

## 🔧 Development Configuration

### Environment Files
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  cacheTimeout: 2 * 60 * 1000, // 2 minutes
  defaultRegion: 'saudi arabia',
  defaultPageSize: 50
};
```

### Angular CLI Commands
```bash
ng serve                    # Development server
ng build                    # Production build
ng test                     # Unit tests
ng lint                     # Code linting
ng generate component name  # Generate component
ng generate service name    # Generate service
```

## 🎯 Key Components

### FlightListComponent
- Displays paginated flight data in responsive table
- Handles regional filtering and pagination
- Uses NgRx for state management
- Implements loading states and error handling

### FlightMapComponent
- Interactive Leaflet map with flight markers
- Real-time marker updates with directional indicators
- Click markers for flight details popup
- Responsive map controls

### FlightStatisticsComponent
- Analytics dashboard with visual progress bars
- Altitude and speed distribution charts
- Flight direction analysis with compass visualization
- Key insights and regional activity summary

### NavbarComponent
- Responsive Bootstrap navigation
- Dark/light theme toggle (☀️/🌙)
- Mobile burger menu
- Active route highlighting

## 🔄 State Management (NgRx)

### State Structure
```typescript
interface FlightState {
  flights: Flight[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  currentRegion: string;
  statistics: FlightStatistics | null;
  lastUpdated: Date | null;
}
```

### Actions
- `loadFlights` - Fetch flights data
- `loadFlightsSuccess` - Flights loaded successfully
- `loadFlightsFailure` - Flights loading failed
- `setRegion` - Change selected region
- `loadStatistics` - Fetch statistics data

### Effects
- Handle API calls to backend
- Manage error states
- Cache management

## 🎨 Theming & Styling

### Theme System
- Light theme: Clean, bright interface
- Dark theme: Low-light comfortable viewing
- Smooth CSS transitions between themes
- Persistent theme selection (localStorage)
- Bootstrap 5.3 with custom SCSS variables

### Responsive Design
- Bootstrap breakpoints (sm, md, lg, xl)
- Collapsible navigation for mobile
- Responsive tables with horizontal scroll
- Touch-friendly map controls

### Custom Styling
```scss
// _variables.scss
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
  --card-bg: #2d2d2d;
}
```

## ⚡ Performance Optimizations

### Angular Optimizations
- OnPush change detection strategy
- TrackBy functions for ngFor loops
- Lazy loading for route modules
- Tree shaking with production builds

### Caching Strategy
- HTTP interceptor for API caching (2 minutes)
- Service worker for offline capability
- Component-level caching for expensive operations

### Bundle Optimization
```bash
# Analyze bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/flight-tracker/stats.json
```


## 🚀 Build & Deployment

### Production Build
```bash
# Standard build
ng build --configuration production

# Build with source maps
ng build --configuration production --source-map

# Build with bundle analysis
ng build --configuration production --stats-json
```

### Build Optimization
- Ahead-of-Time (AOT) compilation
- Tree shaking for unused code removal
- Minification and compression
- Service worker for caching

## 🔍 Debugging

### Development Tools
- Angular DevTools browser extension
- Redux DevTools for NgRx state inspection
- Chrome DevTools for performance profiling

### Common Issues
- CORS errors: Ensure backend is running on port 3000
- State not updating: Check NgRx actions and reducers
- Map not loading: Verify Leaflet CSS imports

## 📚 Dependencies

### Core Dependencies
- `@angular/core` - Angular framework
- `@ngrx/store` - State management
- `@ngrx/effects` - Side effects handling
- `leaflet` - Interactive maps
- `bootstrap` - UI framework

### Development Dependencies
- `@angular/cli` - Angular CLI tools
- `typescript` - TypeScript compiler
- `sass` - SCSS preprocessing
- `karma` - Test runner
- `jasmine` - Testing framework

---

**Frontend developed with Angular 17 and TypeScript**
