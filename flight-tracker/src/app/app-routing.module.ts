import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlightMapComponent } from './components/flight-map/flight-map.component';
import { FlightListComponent } from './components/flight-list/flight-list.component';
import { FlightDetailsComponent } from './components/flight-details/flight-details.component';


const routes: Routes = [
  {path:``, redirectTo:`/map`, pathMatch:`full`},
  {path:`map`, component:FlightMapComponent},
  {path:`list`, component:FlightListComponent},
  {path:`details/:id`, component: FlightDetailsComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
