import {Component, OnInit} from '@angular/core';
import {ResourceService} from "../../../shared/services/resource.service";
import {WorkflowService} from "../../../shared/services/workflow.service";
import {TrueConstraint} from "../../../shared/models/constraints/true-constraint";


@Component({
  selector: 'patient-selection',
  templateUrl: './patient-selection.component.html',
  styleUrls: ['./patient-selection.component.css']
})
export class PatientSelectionComponent implements OnInit {
  patientCount: number;
  responseMessage: string;

  constructor(private resourceService: ResourceService,
              private workflowService: WorkflowService) {
    this.patientCount = 0;
    this.responseMessage = "";
  }


  ngOnInit() {
  }

  runPatientQuery() {
    let trueConstraint = new TrueConstraint();

    this.resourceService.getPatients(trueConstraint)
      .subscribe(
        patients => {
          this.patientCount = patients.length;
        },
        err => {
          console.error(err);
        }
      );
  }

  savePatientSet() {
    let name = 'test_patient_set';
    let trueConstraint = new TrueConstraint();
    this.resourceService.savePatients(name, trueConstraint)
      .subscribe(
        result => {
          this.responseMessage = JSON.stringify(result);
        },
        err => {
          console.error(err);
        }
      );
  }



}
