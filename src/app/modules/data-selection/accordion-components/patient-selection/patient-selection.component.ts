import {
  Component, OnInit, ViewChild
} from '@angular/core';
import {
  trigger, state, style, animate, transition
} from '@angular/animations';
import {ConstraintComponent} from "../../constraint-components/constraint/constraint.component";
import {CombinationConstraint} from "../../../shared/models/constraints/combination-constraint";
import {ConstraintService} from "../../../shared/services/constraint.service";


@Component({
  selector: 'patient-selection',
  templateUrl: './patient-selection.component.html',
  styleUrls: ['./patient-selection.component.css'],
  animations: [
    trigger('notifyState', [
      state('loading', style({
        display: 'none'
      })),
      transition( 'loading => complete', [
        style({
          background: 'rgba(51, 156, 144, 1.0)'
        }),
        animate('1000ms ease-out', style({
          background: 'rgba(255, 255, 255, 0.0)'
        }))
      ])
    ])
  ]
})
export class PatientSelectionComponent implements OnInit {

  patientSetName: string = "";

  @ViewChild('rootInclusionConstraintComponent') rootInclusionConstraintComponent: ConstraintComponent;
  @ViewChild('rootExclusionConstraintComponent') rootExclusionConstraintComponent: ConstraintComponent;

  constructor(private _constraintService: ConstraintService) {
  }

  ngOnInit() {
    this.constraintService.update();
  }

  get constraintService(): ConstraintService {
    return this._constraintService;
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
