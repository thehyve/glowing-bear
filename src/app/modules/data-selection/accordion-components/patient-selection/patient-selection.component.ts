import {
  Component, OnInit, ViewChild
} from '@angular/core';
import {ResourceService} from "../../../shared/services/resource.service";
import {WorkflowService} from "../../../shared/services/workflow.service";
import {ConstraintComponent} from "../../constraint-components/constraint/constraint.component";
import {CombinationConstraint} from "../../../shared/models/constraints/combination-constraint";
import {PatientSetPostResponse} from "../../../shared/models/patient-set-post-response";


@Component({
  selector: 'patient-selection',
  templateUrl: './patient-selection.component.html',
  styleUrls: ['./patient-selection.component.css']
})
export class PatientSelectionComponent implements OnInit {

  patientCount: number = 0;
  patientSetName: string = "";
  patientSetPostResponse: PatientSetPostResponse = null;
  rootInclusionConstraint: CombinationConstraint = new CombinationConstraint();
  rootExclusionConstraint: CombinationConstraint = new CombinationConstraint();

  @ViewChild('rootInclusionConstraintComponent') rootInclusionConstraintComponent: ConstraintComponent;
  @ViewChild('rootExclusionConstraintComponent') rootExclusionConstraintComponent: ConstraintComponent;

  constructor(private resourceService: ResourceService,
              private workflowService: WorkflowService) {
  }

  ngOnInit() {
  }

  runPatientQuery() {
    this.resourceService.getPatients(this.rootInclusionConstraint, this.rootExclusionConstraint)
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
    this.resourceService.savePatients(this.patientSetName, this.rootInclusionConstraint, this.rootExclusionConstraint)
      .subscribe(
        result => {
          this.patientSetPostResponse = result;
        },
        err => {
          console.error(err);
        }
      );
  }



}
