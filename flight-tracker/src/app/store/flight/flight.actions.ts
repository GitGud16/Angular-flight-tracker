import { createAction, props } from '@ngrx/store';
import { Flight } from '../../services/flight.service';

export const toggleFlightVisibility = createAction(
  '[Flight] Toggle Flight Visibility',
  props<{ flight: Flight }>()
);

export const loadFlights = createAction('[Flight] Load Flights');

export const loadFlightsSuccess = createAction(
  '[Flight] Load Flights Success',
  props<{ flights: Flight[] }>()
);

export const loadFlightsFailure = createAction(
  '[Flight] Load Flights Failure',
  props<{ error: any }>()
);