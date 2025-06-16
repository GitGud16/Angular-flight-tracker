import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as FlightActions from './flight.actions';
import { FlightService } from '../../services/flight.service';

@Injectable()
export class FlightEffects {
  loadFlights$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FlightActions.loadFlights),
      switchMap(action =>
        this.flightService.getFlights(
          action.region || 'all',
          action.page || 1,
          action.limit || 100
        ).pipe(
          map(response => FlightActions.loadFlightsSuccess({ response })),
          catchError(error => of(FlightActions.loadFlightsFailure({ error })))
        )
      )
    )
  );

  loadMoreFlights$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FlightActions.loadMoreFlights),
      switchMap(action =>
        this.flightService.getFlights(
          action.region,
          action.page,
          action.limit || 100
        ).pipe(
          map(response => FlightActions.loadFlightsSuccess({ response })),
          catchError(error => of(FlightActions.loadFlightsFailure({ error })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private flightService: FlightService
  ) {}
}