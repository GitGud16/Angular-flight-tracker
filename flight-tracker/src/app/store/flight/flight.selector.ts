import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FlightState } from './flight.reducer';
import { Flight } from './../../services/flight.service';

export const selectFlightState = createFeatureSelector<FlightState>('flight');

export const selectAllFlights = createSelector(
  selectFlightState,
  (state: FlightState) => state.flights
);

export const selectVisibleFlights = createSelector(
  selectFlightState,
  selectAllFlights,
  (state: FlightState, flights: Flight[]) =>
    flights.filter(flight => state.visibleFlights.has(flight.id))
);

export const selectIsFlightVisible = (flightId: string) =>
  createSelector(
    selectFlightState,
    (state: FlightState) => state.visibleFlights.has(flightId)
  );

export const selectFlightsLoading = createSelector(
  selectFlightState,
  (state: FlightState) => state.loading
);

export const selectFlightsError = createSelector(
  selectFlightState,
  (state: FlightState) => state.error
);

export const selectPagination = createSelector(
  selectFlightState,
  (state: FlightState) => state.pagination
);

export const selectCurrentRegion = createSelector(
  selectFlightState,
  (state: FlightState) => state.currentRegion
);

export const selectFilters = createSelector(
  selectFlightState,
  (state: FlightState) => state.filters
);

export const selectHasNextPage = createSelector(
  selectPagination,
  (pagination) => pagination?.hasNextPage || false
);

export const selectHasPrevPage = createSelector(
  selectPagination,
  (pagination) => pagination?.hasPrevPage || false
);

export const selectCurrentPage = createSelector(
  selectPagination,
  (pagination) => pagination?.currentPage || 1
);

export const selectTotalPages = createSelector(
  selectPagination,
  (pagination) => pagination?.totalPages || 0
);

export const selectTotalFlights = createSelector(
  selectPagination,
  (pagination) => pagination?.totalFlights || 0
);

export const selectAreAllFlightsVisible = createSelector(
  selectFlightState,
  selectAllFlights,
  (state: FlightState, flights: Flight[]) => {
    // Filter flights to only include those with valid coordinates
    const flightsWithCoordinates = flights.filter(flight => 
      flight.latitude !== null && flight.longitude !== null && 
      flight.latitude !== undefined && flight.longitude !== undefined &&
      !isNaN(flight.latitude) && !isNaN(flight.longitude)
    );
    
    if (flightsWithCoordinates.length === 0) return false;
    return flightsWithCoordinates.every(flight => state.visibleFlights.has(flight.id));
  }
);

export const selectVisibleFlightsCount = createSelector(
  selectVisibleFlights,
  (visibleFlights: Flight[]) => visibleFlights.length
);

export const selectFlightsWithCoordinatesCount = createSelector(
  selectAllFlights,
  (flights: Flight[]) => flights.filter(flight => 
    flight.latitude !== null && flight.longitude !== null && 
    flight.latitude !== undefined && flight.longitude !== undefined &&
    !isNaN(flight.latitude) && !isNaN(flight.longitude)
  ).length
);