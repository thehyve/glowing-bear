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

type LoadingState = 'loading' | 'complete';

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
    this.queryService.updateCounts_1(false, true);
  }

  get subjectCount_1(): number {
    return this.queryService.subjectCount_1;
  }

  get inclusionSubjectCount(): number {
    return this.queryService.inclusionSubjectCount;
  }

  get exclusionSubjectCount(): number {
    return this.queryService.exclusionSubjectCount;
  }

  get rootInclusionConstraint(): CombinationConstraint {
    return this.constraintService.rootInclusionConstraint;
  }

  get rootExclusionConstraint(): CombinationConstraint {
    return this.constraintService.rootExclusionConstraint;
  }

  clearCriteria() {
    this.constraintService.clearSelectionConstraint();
    this.queryService.updateCounts_1(false, true);
  }

  get loadingStateInclusion(): LoadingState {
    return this.queryService.loadingStateInclusion;
  }

  get loadingStateExclusion(): LoadingState {
    return this.queryService.loadingStateExclusion;
  }

  get loadingStateTotal(): LoadingState {
    return this.queryService.loadingStateTotal;
  }

}
