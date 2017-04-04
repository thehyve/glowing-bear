import { Component } from '@angular/core';
import {EndpointService} from "./modules/shared/services/endpoint.service";
import {Location, LocationStrategy, HashLocationStrategy} from "@angular/common";

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
