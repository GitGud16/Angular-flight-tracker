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
    try {
      // First try to use global Leaflet from CDN
      if ((window as any).L) {
        this.L = (window as any).L;
        console.log('Using global Leaflet from CDN');
      } else {
        // Fallback to dynamic import
        console.log('Trying dynamic import for Leaflet');
        const leafletModule = await import('leaflet');
        this.L = leafletModule.default || leafletModule;
      }
      
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        try {
          this.initMap();
          this.initCustomIcon();
        } catch (mapError) {
          console.error('Error initializing map:', mapError);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error loading Leaflet:', error);
    }
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
        // Update existing marker position and rotation
        this.markers[flight.id].setLatLng(latLng);
        this.updateMarkerRotation(this.markers[flight.id], flight.true_track);
      } else {
        // Create new marker with rotation
        const rotatedIcon = this.createRotatedIcon(flight.true_track);
        const marker = this.L.marker(latLng, { icon: rotatedIcon })
          .addTo(this.map)
          .bindPopup(`
            <div>
              <strong>Flight:</strong> ${flight.callsign}<br>
              <strong>Origin:</strong> ${flight.origin}<br>
              <strong>Altitude:</strong> ${flight.altitude?.toFixed(0) || 'N/A'} m<br>
              <strong>Speed:</strong> ${flight.velocity?.toFixed(0) || 'N/A'} m/s<br>
              <strong>Heading:</strong> ${flight.true_track?.toFixed(0) || 'N/A'}°<br>
              <strong>Status:</strong> ${flight.on_ground ? '🛬 On Ground' : '✈️ Flying'}
            </div>
          `);
        this.markers[flight.id] = marker;
      }
    });
  }

  private createRotatedIcon(heading: number): any {
    if (!heading && heading !== 0) {
      // If no heading data, use default icon
      return this.customIcon;
    }

    // Adjust rotation: subtract 45° since the plane icon is rotated 45° by default
    const rotation = heading - 45;
    
    return this.L.divIcon({
      html: `
        <div style="
          width: 32px; 
          height: 32px; 
          transform: rotate(${rotation}deg);
          transform-origin: center;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <img src="assets/images/heavy.png" 
               style="width: 100%; height: 100%;" 
               alt="plane">
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
      className: 'rotated-plane-icon'
    });
  }

  private updateMarkerRotation(marker: any, heading: number): void {
    if (!heading && heading !== 0) return;
    
    // For existing markers, we need to recreate the icon with new rotation
    const rotatedIcon = this.createRotatedIcon(heading);
    marker.setIcon(rotatedIcon);
  }
}