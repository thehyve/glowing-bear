import {Component, OnInit} from '@angular/core';
import {ResourceService} from "../../../shared/services/resource.service";
import {WorkflowService} from "../../../shared/services/workflow.service";

@Component({
  selector: 'patient-selection',
  templateUrl: './patient-selection.component.html',
  styleUrls: ['./patient-selection.component.css'],
  providers: [ResourceService, WorkflowService]
})
export class PatientSelectionComponent implements OnInit {
  patientCount: number;

  constructor(private resourceService: ResourceService, private workflowService: WorkflowService) {
    this.patientCount = 0;
  }

  ngOnInit() {
  }

  runPatientQuery() {

    let currentWorkflow = this.workflowService.getCurrentWorkflow();

    console.log('run patient query');
    this.resourceService.getPatients().subscribe(
      patientsObj => {
        console.log('patients: ', patientsObj);
        currentWorkflow.setPatients(patientsObj['patients']);
        this.patientCount = currentWorkflow.getPatients().length;
      },
      err => {
        console.log(err);
      }
    );

  }

}
