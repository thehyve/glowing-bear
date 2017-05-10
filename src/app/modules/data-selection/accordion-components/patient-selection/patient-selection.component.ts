import {
  Component, OnInit, ViewChild
} from '@angular/core';
import {ConstraintComponent} from "../../constraint-components/constraint/constraint.component";
import {CombinationConstraint} from "../../../shared/models/constraints/combination-constraint";
import {PatientSetPostResponse} from "../../../shared/models/patient-set-post-response";
import {ConstraintService} from "../../../shared/services/constraint.service";


@Component({
  selector: 'patient-selection',
  templateUrl: './patient-selection.component.html',
  styleUrls: ['./patient-selection.component.css']
})
export class PatientSelectionComponent implements OnInit {

  patientSetName: string = "";
  patientSetPostResponse: PatientSetPostResponse = null;
  @ViewChild('rootInclusionConstraintComponent') rootInclusionConstraintComponent: ConstraintComponent;
  @ViewChild('rootExclusionConstraintComponent') rootExclusionConstraintComponent: ConstraintComponent;

  constructor(private constraintService: ConstraintService) {
  }

  ngOnInit() {
    this.constraintService.update();
  }

  get patientCount(): number {
    return this.constraintService.patientCount;
  }

  get inclusionPatientCount(): number {
    return this.constraintService.inclusionPatientCount;
  }

  get exclusionPatientCount(): number {
    return this.constraintService.exclusionPatientCount;
  }

  get rootInclusionConstraint(): CombinationConstraint {
    return this.constraintService.rootInclusionConstraint;
  }

  get rootExclusionConstraint(): CombinationConstraint {
    return this.constraintService.rootExclusionConstraint;
  }

  savePatientSet() {
    this.constraintService.savePatients(this.patientSetName);
  }


}
