import { Component } from '@angular/core';
import {EndpointService} from "./services/endpoint.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [EndpointService]
})
export class AppComponent {

  constructor(private endpointService: EndpointService) {
    console.log('app constructor');
    this.endpointService = endpointService;
  }

}
