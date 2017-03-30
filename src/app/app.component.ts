import { Component } from '@angular/core';
import {EndpointService} from "./services/endpoint.service";
import {Location, LocationStrategy, HashLocationStrategy} from "@angular/common";
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [EndpointService, Location, {provide: LocationStrategy, useClass: HashLocationStrategy}]
})
export class AppComponent {

  constructor(private endpointService: EndpointService) {
  }

}
