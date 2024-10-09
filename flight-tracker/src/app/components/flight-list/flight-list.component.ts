import { Component, OnInit } from '@angular/core';
import { Flight, FlightService } from './../../services/flight.service';
import { Store } from '@ngrx/store';
import * as FlightActions from '../../store/flight/flight.actions';
import * as FlightSelectors from '../../store/flight/flight.selector';
import { Observable } from 'rxjs';



@Component({
  selector: 'app-flight-list',
  templateUrl: './flight-list.component.html',
  styleUrls: ['./flight-list.component.scss']
})
export class FlightListComponent implements OnInit {
  // allFlights: Flight[] = [];
  allFlights$: Observable<Flight[]>;
  filteredFlights: Flight[] = [];
  regions: string[] = ['All', 'Saudi Arabia', 'Europe', 'North America', 'South America', 'Asia', 'Africa', 'Oceania'];
  selectedRegion: string = 'Saudi Arabia';  // Set default to Saudi Arabia

  constructor(
    private flightService: FlightService,
    public store: Store
  ) {
    this.allFlights$ = this.store.select(FlightSelectors.selectAllFlights);


  }

  ngOnInit(): void {
    this.store.dispatch(FlightActions.loadFlights());
    this.allFlights$.subscribe(flights => {
      
      this.filterFlights(flights);
    });

    // this.getFlights();
  }

  // getFlights(): void {
  //   this.flightService.getFlights()
  //     .subscribe(flights => {
  //       this.allFlights = flights;
  //       this.filterFlights();
  //     });
  // }

  filterFlights(flights: Flight[]): void {
    if (this.selectedRegion === 'All') {
      this.filteredFlights = flights;
    } else {
      this.filteredFlights = flights.filter(flight => this.isInRegion(flight, this.selectedRegion));
    }
  }

  isInRegion(flight: Flight, region: string): boolean {
    const lat = flight.latitude;
    const lon = flight.longitude;

    switch (region) {
      case 'Saudi Arabia':
        return lat > 16 && lat < 33 && lon > 34 && lon < 56;
      case 'Europe':
        return lat > 35 && lat < 70 && lon > -25 && lon < 40;
      case 'North America':
        return lat > 15 && lat < 70 && lon > -170 && lon < -50;
      case 'South America':
        return lat > -60 && lat < 15 && lon > -90 && lon < -30;
      case 'Asia':
        return lat > 0 && lat < 70 && lon > 60 && lon < 180;
      case 'Africa':
        return lat > -40 && lat < 35 && lon > -20 && lon < 50;
      case 'Oceania':
        return lat > -50 && lat < 0 && lon > 110 && lon < 180;
      default:
        return false;
    }
  }

  onRegionChange(): void {
    this.allFlights$.subscribe(flights => this.filterFlights(flights));
  }

  onRevealClick(flight: Flight): void {
    this.store.dispatch(FlightActions.toggleFlightVisibility({ flight }));
  }

  isFlightVisible$(flightId: string): Observable<boolean> {
    return this.store.select(FlightSelectors.selectIsFlightVisible(flightId));
  }

  
}
