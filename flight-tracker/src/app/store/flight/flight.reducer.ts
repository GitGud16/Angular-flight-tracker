import { createReducer, on } from '@ngrx/store';
import * as FlightActions from './flight.actions';
import { Flight, PaginationInfo } from '../../services/flight.service';

export interface FlightState {
  flights: Flight[];
  visibleFlights: Set<string>;
  loading: boolean;
  error: any;
  pagination: PaginationInfo | null;
  currentRegion: string;
  filters: {
    region: string;
  };
}

export const initialState: FlightState = {
  flights: [],
  visibleFlights: new Set<string>(),
  loading: false,
  error: null,
  pagination: null,
  currentRegion: 'Saudi Arabia',
  filters: {
    region: 'Saudi Arabia'
  }
};

export const flightReducer = createReducer(
  initialState,
  on(FlightActions.toggleFlightVisibility, (state, { flight }) => {
    const newVisibleFlights = new Set(state.visibleFlights);
    if (newVisibleFlights.has(flight.id)) {
      newVisibleFlights.delete(flight.id);
    } else {
      newVisibleFlights.add(flight.id);
    }
    return { ...state, visibleFlights: newVisibleFlights };
  }),
  on(FlightActions.revealAllFlights, (state) => {
    const newVisibleFlights = new Set(state.visibleFlights);
    // Add all current flights to visible flights, but only if they have valid coordinates
    state.flights.forEach(flight => {
      if (flight.latitude !== null && flight.longitude !== null && 
          flight.latitude !== undefined && flight.longitude !== undefined &&
          !isNaN(flight.latitude) && !isNaN(flight.longitude)) {
        newVisibleFlights.add(flight.id);
      }
    });
    return { ...state, visibleFlights: newVisibleFlights };
  }),
  on(FlightActions.hideAllFlights, (state) => {
    const newVisibleFlights = new Set(state.visibleFlights);
    // Remove all current flights from visible flights
    state.flights.forEach(flight => {
      newVisibleFlights.delete(flight.id);
    });
    return { ...state, visibleFlights: newVisibleFlights };
  }),
  on(FlightActions.toggleAllFlightsVisibility, (state) => {
    const newVisibleFlights = new Set(state.visibleFlights);
    const flightsWithCoordinates = state.flights.filter(flight => 
      flight.latitude !== null && flight.longitude !== null && 
      flight.latitude !== undefined && flight.longitude !== undefined &&
      !isNaN(flight.latitude) && !isNaN(flight.longitude)
    );
    
    // Check if all valid flights are currently visible
    const allValidFlightsVisible = flightsWithCoordinates.length > 0 && 
      flightsWithCoordinates.every(flight => newVisibleFlights.has(flight.id));
    
    if (allValidFlightsVisible) {
      // Hide all flights
      state.flights.forEach(flight => {
        newVisibleFlights.delete(flight.id);
      });
    } else {
      // Reveal all flights with valid coordinates
      flightsWithCoordinates.forEach(flight => {
        newVisibleFlights.add(flight.id);
      });
    }
    
    return { ...state, visibleFlights: newVisibleFlights };
  }),
  on(FlightActions.loadFlights, (state, action) => ({ 
    ...state, 
    loading: true,
    currentRegion: action.region || state.currentRegion,
    filters: {
      ...state.filters,
      region: action.region || state.currentRegion
    }
  })),
  on(FlightActions.loadMoreFlights, (state) => ({ 
    ...state, 
    loading: true 
  })),
  on(FlightActions.loadFlightsSuccess, (state, { response }) => ({
    ...state,
    flights: response.data,
    pagination: response.pagination,
    filters: response.filters,
    loading: false,
    error: null
  })),
  on(FlightActions.loadFlightsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  on(FlightActions.setCurrentRegion, (state, { region }) => ({
    ...state,
    currentRegion: region,
    filters: {
      ...state.filters,
      region: region
    }
  })),
  on(FlightActions.setCurrentPage, (state, { page }) => ({
    ...state,
    pagination: state.pagination ? {
      ...state.pagination,
      currentPage: page
    } : null
  }))
);