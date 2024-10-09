import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { isPlatformBrowser } from '@angular/common';

export interface Flight {
  id: string;
  callsign: string;
  origin: string;
  destination: string;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  true_track: number;
  vertical_rate: number;
  on_ground: boolean;
  sensors?: number[];
  baro_altitude: number;
  squawk?: string;
  spi: boolean;
  position_source: number;
  category?: number;
  last_contact: number;
  time_position?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private openSkyUrl = `https://opensky-network.org/api/states/all`;
  private username = 'Holygeek'
  private pass = '1116826411a'
  // private aviationStackUrl = 'http://api.aviationstack.com/v1/flights';
  // private aviationStackKey = '28d05c126fba4c9e0132f675972a408a';

  constructor(
    private http: HttpClient,
    private cacheService: CacheService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  getFlights(): Observable<Flight[]> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa(this.username + ':' + this.pass)

    })
    if (isPlatformBrowser(this.platformId)) {
      const cachedFlights = this.cacheService.get<Flight[]>('flights');
      if (cachedFlights) {
        return of(cachedFlights);
      }
    }

    return this.http.get<any>(this.openSkyUrl, {headers}).pipe(
      map((response: any) => {
        const flights = response.states.map((state: any) => ({
          id: state[0],
          callsign: state[1]?.trim() || 'N/A',
          origin: this.replaceIsraelWithPalestine(state[2] || 'N/A'),
          destination: 'N/A', // We don't have destination data from OpenSky
          time_position: state[3],
          last_contact: state[4],
          longitude: state[5],
          latitude: state[6],
          baro_altitude: state[7],
          on_ground: state[8],
          velocity: state[9],
          true_track: state[10],
          vertical_rate: state[11],
          sensors: state[12],
          altitude: state[13], // This is the geometric altitude
          squawk: state[14],
          spi: state[15],
          position_source: state[16],
          category: state[17]
        }));
        this.cacheService.set('flights', flights, 5); // Cache for 5 minutes
        return flights;
      }),
      catchError(this.handleError<Flight[]>('getFlights', []))
    );
  }

  getFlight(id: string): Observable<Flight | undefined> {
    return this.getFlights().pipe(
      map(flights => flights.find(flight => flight.id === id))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return new Observable(observer => {
        observer.next(result as T);
        observer.complete();
      });
    };
  }

  private replaceIsraelWithPalestine(value: string): string {
    return value.replace(/Israel/gi, 'Palestine');
  }
}

// Commented out code for AviationStack API integration:
/*
private combineFlightData(realTimeData: any, scheduledData: any): Flight[] {
  const realTimeFlights: Omit<Flight, 'destination' & 'origin'>[] = realTimeData.states.map((state: any) => ({
    id: state[0],
    callsign: state[1]?.trim() || 'N/A',
    origin: state[2],
    latitude: state[6],
    longitude: state[5],
    altitude: state[7],
    true_track: state[10],
    speed: state[9]
  }));

  const scheduledFlights: AviationStackResponse = scheduledData.data.map((flight: any) => ({
    id: flight.flight.iata,
    callsign: flight.flight.iata,
    destination: flight.arrival.airport,
    origin: flight.departure.airport,
  }));

  return realTimeFlights.map(rtFlight => {
    const scheduledFlight = scheduledFlights.find(sf => sf.callsign === rtFlight.callsign);
    return {
      ...rtFlight,
      origin: scheduledFlight?.origin || 'Unknown',
      destination: scheduledFlight?.destination || 'Unknown'
    };
  });
}
*/
