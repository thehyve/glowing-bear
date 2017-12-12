import {
  Component, OnInit, ViewChild
} from '@angular/core';
import {
  trigger, style, animate, transition
} from '@angular/animations';
import {GbConstraintComponent} from '../../constraint-components/gb-constraint/gb-constraint.component';
import {CombinationConstraint} from '../../../../models/constraints/combination-constraint';
import {QueryService} from '../../../../services/query.service';
import {ConstraintService} from '../../../../services/constraint.service';


@Component({
  selector: 'gb-selection',
  templateUrl: './gb-selection.component.html',
  styleUrls: ['./gb-selection.component.css'],
  animations: [
    trigger('notifyState', [
      transition( 'loading => complete', [
        style({
          background: 'rgba(51, 156, 144, 0.5)'
        }),
        animate('1000ms ease-out', style({
          background: 'rgba(255, 255, 255, 0.0)'
        }))
      ])
    ])
  ]
})
export class GbSelectionComponent implements OnInit {

  @ViewChild('rootInclusionConstraintComponent') rootInclusionConstraintComponent: GbConstraintComponent;
  @ViewChild('rootExclusionConstraintComponent') rootExclusionConstraintComponent: GbConstraintComponent;

  constructor(private constraintService: ConstraintService,
              private queryService: QueryService) {
  }

  ngOnInit() {
    this.queryService.updateCounts_1();
  }

  get patientCount_1(): number {
    return this.queryService.patientCount_1;
  }

  get inclusionPatientCount(): number {
    return this.queryService.inclusionPatientCount;
  }

  get exclusionPatientCount(): number {
    return this.queryService.exclusionPatientCount;
  }

  get rootInclusionConstraint(): CombinationConstraint {
    return this.constraintService.rootInclusionConstraint;
  }

  get rootExclusionConstraint(): CombinationConstraint {
    return this.constraintService.rootExclusionConstraint;
  }

  clearCriteria() {
    this.constraintService.clearSelectionConstraint();
    this.queryService.updateCounts_1();
  }

}
