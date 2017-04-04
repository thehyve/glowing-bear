import { Component, OnInit } from '@angular/core';
import {ResourceService} from "../../../../services/resource.service";

@Component({
  selector: 'patient-selection',
  templateUrl: './patient-selection.component.html',
  styleUrls: ['./patient-selection.component.css'],
  providers: [ResourceService]
})
export class PatientSelectionComponent implements OnInit {

  constructor(private resourceService: ResourceService) { }

  ngOnInit() {
  }

  runPatientQuery() {
    console.log('run patient query');
    let promise = this.resourceService.getStudies();
    console.log('promise: ', promise);
  }

}
