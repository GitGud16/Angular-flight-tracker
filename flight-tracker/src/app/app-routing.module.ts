import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlightListComponent } from './components/flight-list/flight-list.component';
import { FlightDetailsComponent } from './components/flight-details/flight-details.component';
import { FlightMapComponent } from './components/flight-map/flight-map.component';
import { FlightStatisticsComponent } from './components/flight-statistics/flight-statistics.component';

const routes: Routes = [
  { path: '', redirectTo: '/flights', pathMatch: 'full' },
  { path: 'flights', component: FlightListComponent },
  { path: 'statistics', component: FlightStatisticsComponent },
  { path: 'details/:id', component: FlightDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
