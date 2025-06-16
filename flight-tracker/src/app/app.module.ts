import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environments';
import { flightReducer } from './store/flight/flight.reducer';
import { FlightEffects } from './store/flight/flight.effects';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FlightMapComponent } from './components/flight-map/flight-map.component';
import { FlightListComponent } from './components/flight-list/flight-list.component';
import { FlightDetailsComponent } from './components/flight-details/flight-details.component';
import { FlightStatisticsComponent } from './components/flight-statistics/flight-statistics.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { StoreModule } from '@ngrx/store';

@NgModule({
  declarations: [
    AppComponent,
    FlightMapComponent,
    FlightListComponent,
    FlightDetailsComponent,
    FlightStatisticsComponent,
    SearchBarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    FormsModule,
    StoreModule.forRoot({ flight: flightReducer }),
    StoreDevtoolsModule.instrument({ 
      maxAge: 25,
      logOnly: environment.production,
       }),
    EffectsModule.forRoot([FlightEffects])
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
