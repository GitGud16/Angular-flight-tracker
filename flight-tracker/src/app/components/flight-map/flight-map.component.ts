import { Component, OnInit, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Store } from '@ngrx/store';
import { Flight } from '../../services/flight.service';
import * as FlightSelectors from '../../store/flight/flight.selector';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-flight-map',
  templateUrl: './flight-map.component.html',
  styleUrl: './flight-map.component.scss'
})
export class FlightMapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map: any;
  private L: any;
  private markers: { [id: string]: any } = {};
  private visibleFlightsSubscription: Subscription | undefined;
  private customIcon: any;

  constructor(
    private store: Store,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.visibleFlightsSubscription = this.store.select(FlightSelectors.selectVisibleFlights)
        .subscribe(flights => {
          if (this.map && this.customIcon) {
            this.updateMarkers(flights);
          }
        });
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadLeaflet();
    }
  }

  ngOnDestroy() {
    if (this.visibleFlightsSubscription) {
      this.visibleFlightsSubscription.unsubscribe();
    }
    if (this.map) {
      this.map.remove();
    }
  }

  private async loadLeaflet() {
    this.L = await import('leaflet');
    this.initMap();
    this.initCustomIcon();
  }

  private initMap(): void {
    this.map = this.L.map('map', {
      center: [ 29, 39 ],
      zoom: 3
    });

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);
  }

  private initCustomIcon(): void {
    this.customIcon = this.L.icon({
      iconUrl: 'assets/images/heavy.png',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  }

  private updateMarkers(flights: Flight[]): void {
    if (!this.map || !this.L || !this.customIcon) return;

    // Remove markers for flights that are no longer visible
    Object.keys(this.markers).forEach(id => {
      if (!flights.some(f => f.id === id)) {
        this.map.removeLayer(this.markers[id]);
        delete this.markers[id];
      }
    });

    // Add or update markers for visible flights
    flights.forEach(flight => {
      const latLng = this.L.latLng(flight.latitude, flight.longitude);
      if (this.markers[flight.id]) {
        this.markers[flight.id].setLatLng(latLng);
      } else {
        const marker = this.L.marker(latLng, { icon: this.customIcon })
          .addTo(this.map)
          .bindPopup(`Flight: ${flight.callsign}`);
        this.markers[flight.id] = marker;
      }
    });
  }
}