import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environments'

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

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalFlights: number;
  flightsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FlightsResponse {
  success: boolean;
  data: Flight[];
  pagination: PaginationInfo;
  filters: {
    region: string;
  };
  timestamp: string;
  error?: string;
}

export interface FlightStatistics {
  totalFlights: number;
  flyingFlights: number;
  groundedFlights: number;
  averageAltitude: number;
  averageSpeed: number;
  highestAltitude: number;
  fastestSpeed: number;
  altitudeRanges: { [key: string]: number };
  speedRanges: { [key: string]: number };
  aircraftCategories: { [key: string]: number };
  flightDirections: { [key: string]: number };
  region: string;
}

export interface StatisticsResponse {
  success: boolean;
  data: FlightStatistics;
  region: string;
  timestamp: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private apiUrl = environment.apiUrl

  constructor(
    private http: HttpClient,
    private cacheService: CacheService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  getFlights(region: string = 'all', page: number = 1, limit: number = 100): Observable<FlightsResponse> {
    // Create cache key based on parameters
    const cacheKey = `flights_${region}_${page}_${limit}`;
    
    // Check cache first
    if (isPlatformBrowser(this.platformId)) {
      const cachedResponse = this.cacheService.get<FlightsResponse>(cacheKey);
      if (cachedResponse) {
        console.log(`📦 Returning cached flights for ${region} (page ${page})`);
        return of(cachedResponse);
      }
    }

    console.log(`🚀 Calling backend API for region: ${region}, page: ${page}, limit: ${limit}`);
    
    // Set up query parameters
    let params = new HttpParams()
      .set('region', region)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<FlightsResponse>(`${this.apiUrl}/flights`, { params }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.error || 'API request failed');
        }
        
        console.log(`✅ Received ${response.data.length} flights for ${region} (page ${page}/${response.pagination.totalPages})`);
        
        // Apply your custom logic (like replacing Israel with Palestine)
        const processedResponse: FlightsResponse = {
          ...response,
          data: response.data.map(flight => ({
            ...flight,
            origin: this.replaceIsraelWithPalestine(flight.origin)
          }))
        };
        
        // Cache the response
        if (isPlatformBrowser(this.platformId)) {
          this.cacheService.set(cacheKey, processedResponse, 2); // Cache for 2 minutes (shorter for paginated data)
          console.log(`💾 Cached flights for ${region} (page ${page})`);
        }
        
        return processedResponse;
      }),
      catchError(this.handleError<FlightsResponse>('getFlights', {
        success: false,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalFlights: 0,
          flightsPerPage: limit,
          hasNextPage: false,
          hasPrevPage: false
        },
        filters: { region },
        timestamp: new Date().toISOString(),
        error: 'Failed to fetch flights'
      }))
    );
  }

  // Legacy method for backward compatibility
  getAllFlights(): Observable<Flight[]> {
    return this.getFlights('all', 1, 10000).pipe(
      map(response => response.data)
    );
  }

  getRegions(): Observable<string[]> {
    return this.http.get<{success: boolean, data: string[]}>(`${this.apiUrl}/regions`).pipe(
      map(response => response.success ? response.data : []),
      catchError(() => of(['All', 'Saudi Arabia', 'Europe', 'North America', 'South America', 'Asia', 'Africa', 'Oceania']))
    );
  }

  getFlight(id: string): Observable<Flight | undefined> {
    console.log(`🔍 Getting flight ${id} from backend...`);
    return this.http.get<{success: boolean, data: Flight}>(`${this.apiUrl}/flights/${id}`).pipe(
      map(response => {
        if (!response.success) {
          return undefined;
        }
        return {
          ...response.data,
          origin: this.replaceIsraelWithPalestine(response.data.origin)
        };
      }),
      catchError(() => of(undefined))
    );
  }

  getStatistics(region: string = 'all'): Observable<FlightStatistics> {
    // Create cache key for statistics
    const cacheKey = `statistics_${region}`;
    
    // Check cache first
    if (isPlatformBrowser(this.platformId)) {
      const cachedStats = this.cacheService.get<FlightStatistics>(cacheKey);
      if (cachedStats) {
        console.log(`📊 Returning cached statistics for ${region}`);
        return of(cachedStats);
      }
    }

    console.log(`📈 Fetching statistics for region: ${region}`);
    
    // Set up query parameters
    let params = new HttpParams().set('region', region);

    return this.http.get<StatisticsResponse>(`${this.apiUrl}/statistics`, { params }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.error || 'Statistics API request failed');
        }
        
        console.log(`✅ Received statistics for ${region}: ${response.data.totalFlights} total flights`);
        
        // Cache the statistics (longer cache time since it's less frequently changing)
        if (isPlatformBrowser(this.platformId)) {
          this.cacheService.set(cacheKey, response.data, 5); // Cache for 5 minutes
          console.log(`💾 Cached statistics for ${region}`);
        }
        
        return response.data;
      }),
      catchError(this.handleError<FlightStatistics>('getStatistics', {
        totalFlights: 0,
        flyingFlights: 0,
        groundedFlights: 0,
        averageAltitude: 0,
        averageSpeed: 0,
        highestAltitude: 0,
        fastestSpeed: 0,
        altitudeRanges: {},
        speedRanges: {},
        aircraftCategories: {},
        flightDirections: {},
        region: region
      }))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
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
