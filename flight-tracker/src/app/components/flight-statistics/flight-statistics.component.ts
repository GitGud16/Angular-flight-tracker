import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map, switchMap } from 'rxjs';
import { FlightService, FlightStatistics } from '../../services/flight.service';
import * as FlightSelectors from '../../store/flight/flight.selector';

@Component({
  selector: 'app-flight-statistics',
  templateUrl: './flight-statistics.component.html',
  styleUrls: ['./flight-statistics.component.scss']
})
export class FlightStatisticsComponent implements OnInit, OnDestroy {
  statistics$: Observable<FlightStatistics>;
  loading$: Observable<boolean>;
  currentRegion$: Observable<string>;

  constructor(
    private store: Store,
    private flightService: FlightService
  ) {
    this.loading$ = this.store.select(FlightSelectors.selectFlightsLoading);
    this.currentRegion$ = this.store.select(FlightSelectors.selectCurrentRegion);

    // Get statistics from backend API based on current region
    this.statistics$ = this.currentRegion$.pipe(
      switchMap(region => {
        console.log(`📊 Fetching statistics for region: ${region}`);
        return this.flightService.getStatistics(region);
      })
    );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  // Helper methods for template
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getPercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  // Convert m/s to km/h for display
  convertToKmh(mps: number): number {
    return Math.round(mps * 3.6);
  }

  // Convert meters to feet for display
  convertToFeet(meters: number): number {
    return Math.round(meters * 3.28084);
  }

  // Get the most common flight direction
  getMostCommonDirection(directions: { [key: string]: number }): string {
    let maxCount = 0;
    let mostCommon = 'Unknown';
    
    Object.entries(directions).forEach(([direction, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = direction;
      }
    });
    
    return mostCommon;
  }

  // Get insight about flight direction patterns
  getDirectionInsight(directions: { [key: string]: number }): string {
    const mostCommon = this.getMostCommonDirection(directions);
    const totalFlights = Object.values(directions).reduce((sum, count) => sum + count, 0);
    const mostCommonCount = directions[mostCommon] || 0;
    const percentage = totalFlights > 0 ? Math.round((mostCommonCount / totalFlights) * 100) : 0;
    
    return `${percentage}% of flights heading ${mostCommon.toLowerCase()}`;
  }

  // Get activity level description based on flight count
  getActivityLevel(totalFlights: number): string {
    if (totalFlights >= 100) return 'High';
    if (totalFlights >= 50) return 'Moderate';
    if (totalFlights >= 20) return 'Low';
    if (totalFlights > 0) return 'Very Low';
    return 'No';
  }

  // Get regional insight based on statistics
  getRegionalInsight(stats: FlightStatistics, region: string | null): string {
    if (!region || !stats) return 'No data available';
    
    const flyingPercentage = this.getPercentage(stats.flyingFlights, stats.totalFlights);
    const avgAltitudeFt = this.convertToFeet(stats.averageAltitude);
    
    if (region.toLowerCase() === 'saudi arabia') {
      return `${stats.totalFlights} flights tracked over Saudi airspace`;
    } else if (region.toLowerCase() === 'europe') {
      return `Busy European airspace with ${flyingPercentage}% active flights`;
    } else if (region.toLowerCase() === 'north america') {
      return `North American corridor showing ${stats.totalFlights} active flights`;
    } else {
      return `${stats.totalFlights} flights in ${region} region`;
    }
  }
} 