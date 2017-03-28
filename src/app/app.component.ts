import { Component } from '@angular/core';
import {ResourceService} from "./services/resource.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ResourceService]
})
export class AppComponent {

  constructor(private resourceService: ResourceService) {
    console.log('app constructor');
    this.resourceService.authenticate();
  }

}
