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