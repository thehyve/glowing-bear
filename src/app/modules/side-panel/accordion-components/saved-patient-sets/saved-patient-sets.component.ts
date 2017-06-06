import { Component, OnInit } from '@angular/core';
import {PatientSet} from "../../../shared/models/patient-set";
import {ResourceService} from "../../../shared/services/resource.service";

@Component({
  selector: 'saved-patient-sets',
  templateUrl: './saved-patient-sets.component.html',
  styleUrls: ['./saved-patient-sets.component.css']
})
export class SavedPatientSetsComponent implements OnInit {

  patientSets: PatientSet[];

  constructor(private resourceService: ResourceService) {
    //TODO: connect to real backend call
    this.patientSets = resourceService.getPatientSets();
  }

  ngOnInit() {
  }

}
