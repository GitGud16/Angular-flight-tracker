import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { FlightService, Flight } from '../../services/flight.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-flight-map',
  templateUrl: './flight-map.component.html',
  styleUrl: './flight-map.component.scss'
})
export class FlightMapComponent implements OnInit, AfterViewInit {
  private map: any;
  private L: any;

  constructor(
    private flightService: FlightService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Any initialization logic that doesn't depend on the browser
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadLeaflet();
    }
  }

  private async loadLeaflet() {
    this.L = await import('leaflet');
    this.initMap();
  }

  private initMap(): void {
    this.map = this.L.map('map', {
      center: [ 29, 39 ],
      zoom: 3
    });

    const tiles = this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }
}