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
      switchMap(() =>
        this.flightService.getFlights().pipe(
          map(flights => FlightActions.loadFlightsSuccess({ flights })),
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