import { Component, OnInit } from '@angular/core';
import {ResourceService} from "../../../shared/services/resource.service";

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
    // let patients: Patient[];
    console.log('run patient query');
    this.resourceService.getPatients().subscribe(
      patients => {
        console.log('patients: ', patients);
      },
      err => {
        console.log(err);
      }
    );

  }

}
