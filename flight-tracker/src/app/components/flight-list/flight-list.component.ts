import { Component, OnInit } from '@angular/core';
import { Flight, FlightService } from './../../services/flight.service';
import { log } from 'console';

@Component({
  selector: 'app-flight-list',
  templateUrl: './flight-list.component.html',
  styleUrl: './flight-list.component.scss'
})
export class FlightListComponent {
flights: Flight[]=[]

constructor(private flightService:FlightService){}

ngOnInit():void{
this.getFlights();  
}

getFlights():void{
  this.flightService.getFlights()
  .subscribe(flights => {
    this.flights = flights
  console.log(flights)})
}







}
