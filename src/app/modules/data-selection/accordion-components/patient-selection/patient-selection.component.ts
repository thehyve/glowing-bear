import {Component, OnInit, ViewChild} from '@angular/core';
import {ResourceService} from "../../../shared/services/resource.service";
import {WorkflowService} from "../../../shared/services/workflow.service";
import {TrueConstraint} from "../../../shared/models/constraints/true-constraint";
import { StudyConstraintComponent } from '../../constraint-components/study-constraint/study-constraint.component';


@Component({
  selector: 'patient-selection',
  templateUrl: './patient-selection.component.html',
  styleUrls: ['./patient-selection.component.css']
})
export class PatientSelectionComponent implements OnInit {
  patientCount: number;
  responseMessage: string;

  //TODO: consider using events instead of a reference to the constraint component
  @ViewChild('constraint') constraint: StudyConstraintComponent;

  constructor(private resourceService: ResourceService,
              private workflowService: WorkflowService) {
    this.patientCount = 0;
    this.responseMessage = "";
  }


  ngOnInit() {
  }

  runPatientQuery() {
    let constraint = this.constraint.getConstraint();
    this.resourceService.getPatients(constraint)
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
