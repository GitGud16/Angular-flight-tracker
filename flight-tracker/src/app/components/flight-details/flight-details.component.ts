import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { FlightService, Flight } from '../../services/flight.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-flight-details',
  templateUrl: './flight-details.component.html',
  styleUrls: ['./flight-details.component.scss']
})
export class FlightDetailsComponent implements OnInit {
  flight$: Observable<Flight | undefined>;

  constructor(
    private route: ActivatedRoute,
    private flightService: FlightService,
    private location: Location
  ) {
    this.flight$ = new Observable<Flight | undefined>();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.flight$ = this.flightService.getFlight(id);
    }
  }

  goBack(): void {
    this.location.back();
  }

  getPositionSource(source: number): string {
    switch(source) {
      case 0: return 'ADS-B';
      case 1: return 'ASTERIX';
      case 2: return 'MLAT';
      case 3: return 'FLARM';
      default: return 'Unknown';
    }
  }
}
