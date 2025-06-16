import { Component, OnInit, OnDestroy } from '@angular/core';
import { Flight } from './../../services/flight.service';
import { Store } from '@ngrx/store';
import * as FlightActions from '../../store/flight/flight.actions';
import * as FlightSelectors from '../../store/flight/flight.selector';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-flight-list',
  templateUrl: './flight-list.component.html',
  styleUrls: ['./flight-list.component.scss']
})
export class FlightListComponent implements OnInit, OnDestroy {
  // Observables from store
  flights$: Observable<Flight[]>;
  loading$: Observable<boolean>;
  pagination$: Observable<any>;
  currentRegion$: Observable<string>;
  hasNextPage$: Observable<boolean>;
  hasPrevPage$: Observable<boolean>;
  currentPage$: Observable<number>;
  totalPages$: Observable<number>;
  totalFlights$: Observable<number>;
  areAllFlightsVisible$: Observable<boolean>;
  visibleFlightsCount$: Observable<number>;
  flightsWithCoordinatesCount$: Observable<number>;

  // Component state
  regions: string[] = ['All', 'Saudi Arabia', 'Europe', 'North America', 'South America', 'Asia', 'Africa', 'Oceania'];
  selectedRegion: string = 'Saudi Arabia';
  currentPage: number = 1;
  pageSize: number = 50; // Show 50 flights per page for better UI performance
  
  private subscription = new Subscription();

  constructor(public store: Store) {
    // Set up observables
    this.flights$ = this.store.select(FlightSelectors.selectAllFlights);
    this.loading$ = this.store.select(FlightSelectors.selectFlightsLoading);
    this.pagination$ = this.store.select(FlightSelectors.selectPagination);
    this.currentRegion$ = this.store.select(FlightSelectors.selectCurrentRegion);
    this.hasNextPage$ = this.store.select(FlightSelectors.selectHasNextPage);
    this.hasPrevPage$ = this.store.select(FlightSelectors.selectHasPrevPage);
    this.currentPage$ = this.store.select(FlightSelectors.selectCurrentPage);
    this.totalPages$ = this.store.select(FlightSelectors.selectTotalPages);
    this.totalFlights$ = this.store.select(FlightSelectors.selectTotalFlights);
    this.areAllFlightsVisible$ = this.store.select(FlightSelectors.selectAreAllFlightsVisible);
    this.visibleFlightsCount$ = this.store.select(FlightSelectors.selectVisibleFlightsCount);
    this.flightsWithCoordinatesCount$ = this.store.select(FlightSelectors.selectFlightsWithCoordinatesCount);
  }

  ngOnInit(): void {
    // Load flights for default region (Saudi Arabia) on component init
    this.loadFlights();

    // Subscribe to current page changes
    this.subscription.add(
      this.currentPage$.subscribe(page => {
        this.currentPage = page;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadFlights(): void {
    console.log(`🔄 Loading flights for region: ${this.selectedRegion}, page: ${this.currentPage}`);
    this.store.dispatch(FlightActions.loadFlights({
      region: this.selectedRegion.toLowerCase(),
      page: this.currentPage,
      limit: this.pageSize
    }));
  }

  onRegionChange(): void {
    console.log(`🌍 Region changed to: ${this.selectedRegion}`);
    this.currentPage = 1; // Reset to first page when changing region
    this.store.dispatch(FlightActions.setCurrentRegion({ region: this.selectedRegion }));
    this.loadFlights();
  }

  onNextPage(): void {
    this.currentPage++;
    this.store.dispatch(FlightActions.setCurrentPage({ page: this.currentPage }));
    this.loadFlights();
  }

  onPrevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.store.dispatch(FlightActions.setCurrentPage({ page: this.currentPage }));
      this.loadFlights();
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.store.dispatch(FlightActions.setCurrentPage({ page: this.currentPage }));
    this.loadFlights();
  }

  onRevealClick(flight: Flight): void {
    this.store.dispatch(FlightActions.toggleFlightVisibility({ flight }));
  }

  onRevealAllFlights(): void {
    console.log('🗺️ Toggling all flights visibility on map');
    this.store.dispatch(FlightActions.toggleAllFlightsVisibility());
  }

  isFlightVisible$(flightId: string): Observable<boolean> {
    return this.store.select(FlightSelectors.selectIsFlightVisible(flightId));
  }

  // TrackBy function for better ngFor performance
  trackByFlightId(index: number, flight: Flight): string {
    return flight.id;
  }

  // Check if flight has valid coordinates for map display
  hasValidCoordinates(flight: Flight): boolean {
    return flight.latitude !== null && flight.longitude !== null && 
           flight.latitude !== undefined && flight.longitude !== undefined &&
           !isNaN(flight.latitude) && !isNaN(flight.longitude);
  }

  // Helper method to generate page numbers for pagination UI
  getPageNumbers(totalPages: number = 1): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
