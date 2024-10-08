import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CacheService } from './cache.service';

export interface Flight{
  id:string;
  callsign:string;
  origin:string;
  destination:string;
  latitude:number;
  longitude:number;
  altitude:number;
  true_track:number;
  speed:number;
}

export type AviationStackResponse=Omit<
Flight,
'speed' & 'true_track'&'altitude'&'latitude'&'longitude'
>[]
@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private openSkyUrl = `https://opensky-network.org/api/states/all`
  private aviationStackUrl='http://api.aviationstack.com/v1/flights'
  private aviationStackKey='28d05c126fba4c9e0132f675972a408a'


  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) { }

  getFlights(): Observable<Flight[]>{
    const cachedFlights = this.cacheService.get<Flight[]>('flights')
    if(cachedFlights){
      return of(cachedFlights)
    }

     const flights = forkJoin({
      realTime: this.http.get(this.openSkyUrl),
      scheduled: this.http.get(`${this.aviationStackUrl}?access_key=${this.aviationStackKey}`)
    }).pipe(
      map(({realTime, scheduled})=>this.combineFlightData(realTime, scheduled)),
      tap(flights=>this.cacheService.set('flights',flights,288)),
      catchError(this.handleError<Flight[]>('getFlights',[]))
    )
    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",flights)
    return flights
    // return this.http.get(this.openSkyUrl).pipe(
    //   map((response: any)=>{
    //     return response.states.map((state: any)=>{
    //       console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",state)
          
    //       return{
    //       id:state[0],
    //       callsign:state[1]?.trim() || 'N/A',
    //       origin: state[2] || 'N/A',
    //       destination:'N/A',
    //       latitude: state[6],
    //       longitude: state[5],
    //       altitude: state[7],
    //       trueTrack:state[10],
    //       speed: state[9]
    //     }})
    //   }),
    //   catchError(this.handleError<Flight[]>('getFlights',[]))
    // )
  }

  private combineFlightData(realTimeData: any, scheduledData: any): Flight[] {
    const realTimeFlights:Omit<Flight,'destination'&'origin'>[] = realTimeData.states.map((state: any) => ({
      id: state[0],
      callsign: state[1]?.trim() || 'N/A',
      latitude: state[6],
      longitude: state[5],
      altitude: state[7],
      true_track:state[10],
      speed: state[9]
    }));

    const scheduledFlights: AviationStackResponse = scheduledData.data.map((flight: any) => ({
      id: flight.flight.iata,
      callsign: flight.flight.iata,
      origin: flight.departure.airport,
      destination: flight.arrival.airport
    }));

    // Combine the data based on callsign
    return realTimeFlights.map(rtFlight => {
      const scheduledFlight = scheduledFlights.find(sf => sf.callsign === rtFlight.callsign);
      return {
        ...rtFlight,
        origin: scheduledFlight?.origin || 'Unknown',
        destination: scheduledFlight?.destination || 'Unknown'
      };
    });
  }

  getFlight(id:string):Observable<Flight | undefined>{
    return this.getFlights().pipe(
      map(flights=>flights.find(flight=>flight.id===id))
    )
  }
  private handleError<T>(operation='operation', result?:T){
    return(error:any): Observable<T>=>{
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    }
  }
}
