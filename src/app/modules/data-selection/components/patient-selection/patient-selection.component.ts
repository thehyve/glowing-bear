import {Component, OnInit} from '@angular/core';
import {ResourceService} from "../../../shared/services/resource.service";
import {WorkflowService} from "../../../shared/services/workflow.service";
import {TrueConstraint} from "../../../shared/models/constraints/TrueConstraint";

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

    let trueConstraint = new TrueConstraint();

    this.resourceService.getPatients(trueConstraint)
      .subscribe(
        patients => {
          currentWorkflow.setPatients(patients); 
          this.patientCount = currentWorkflow.getPatients().length;
        },
        err => {
          console.error(err);
        }
      );
  }

  savePatientSet(constraint: string) {

  }

}
