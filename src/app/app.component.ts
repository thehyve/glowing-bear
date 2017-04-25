import {Component} from '@angular/core';
import {WorkflowService} from "./modules/shared/services/workflow.service";
import {EndpointService} from "./modules/shared/services/endpoint.service";
import {ResourceService} from "./modules/shared/services/resource.service";
import {ConfigService} from "./modules/shared/services/config/config.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private configService: ConfigService,
              private endpointService: EndpointService,
              private workflowService: WorkflowService,
              private resourceService: ResourceService) {
  }

}
