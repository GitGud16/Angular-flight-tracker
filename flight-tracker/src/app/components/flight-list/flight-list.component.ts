import { Component, OnInit } from '@angular/core';
import { Flight, FlightService } from './../../services/flight.service';

@Component({
  selector: 'app-flight-list',
  templateUrl: './flight-list.component.html',
  styleUrls: ['./flight-list.component.scss']
})
export class FlightListComponent implements OnInit {
  allFlights: Flight[] = [];
  filteredFlights: Flight[] = [];
  regions: string[] = ['All', 'Europe', 'North America', 'South America', 'Asia', 'Africa', 'Oceania', 'Middle East'];
  selectedRegion: string = 'Middle East';  // Changed this line to set default to Middle East

  constructor(private flightService: FlightService) {}

  ngOnInit(): void {
    this.getFlights();
  }

  getFlights(): void {
    this.flightService.getFlights()
      .subscribe(flights => {
        this.allFlights = flights;
        this.filterFlights();
        console.log(flights);
      });
  }

  filterFlights(): void {
    if (this.selectedRegion === 'All') {
      this.filteredFlights = this.allFlights;
    } else {
      this.filteredFlights = this.allFlights.filter(flight => this.isInRegion(flight, this.selectedRegion));
    }
  }

  isInRegion(flight: Flight, region: string): boolean {
    const lat = flight.latitude;
    const lon = flight.longitude;

    switch (region) {
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
      case 'Middle East':
        return lat > 12 && lat < 42 && lon > 25 && lon < 65;
      default:
        return false;
    }
  }

  onRegionChange(): void {
    this.filterFlights();
  }
}
