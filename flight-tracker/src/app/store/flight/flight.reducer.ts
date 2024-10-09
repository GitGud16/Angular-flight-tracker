import { createReducer, on } from '@ngrx/store';
import * as FlightActions from './flight.actions';
import { Flight } from '../../services/flight.service';

export interface FlightState {
  flights: Flight[];
  visibleFlights: Set<string>;
  loading: boolean;
  error: any;
}

export const initialState: FlightState = {
  flights: [],
  visibleFlights: new Set<string>(),
  loading: false,
  error: null
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
  on(FlightActions.loadFlights, state => ({ ...state, loading: true })),
  on(FlightActions.loadFlightsSuccess, (state, { flights }) => ({
    ...state,
    flights,
    loading: false
  })),
  on(FlightActions.loadFlightsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
);