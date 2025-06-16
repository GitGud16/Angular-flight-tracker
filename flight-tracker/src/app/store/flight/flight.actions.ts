import { createAction, props } from '@ngrx/store';
import { Flight, FlightsResponse } from '../../services/flight.service';

export const toggleFlightVisibility = createAction(
  '[Flight] Toggle Flight Visibility',
  props<{ flight: Flight }>()
);

export const toggleAllFlightsVisibility = createAction(
  '[Flight] Toggle All Flights Visibility'
);

export const revealAllFlights = createAction(
  '[Flight] Reveal All Flights'
);

export const hideAllFlights = createAction(
  '[Flight] Hide All Flights'
);

export const loadFlights = createAction(
  '[Flight] Load Flights',
  props<{ region?: string; page?: number; limit?: number }>()
);

export const loadFlightsSuccess = createAction(
  '[Flight] Load Flights Success',
  props<{ response: FlightsResponse }>()
);

export const loadFlightsFailure = createAction(
  '[Flight] Load Flights Failure',
  props<{ error: any }>()
);

export const loadMoreFlights = createAction(
  '[Flight] Load More Flights',
  props<{ region: string; page: number; limit?: number }>()
);

export const setCurrentRegion = createAction(
  '[Flight] Set Current Region',
  props<{ region: string }>()
);

export const setCurrentPage = createAction(
  '[Flight] Set Current Page',
  props<{ page: number }>()
);