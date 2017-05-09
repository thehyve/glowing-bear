import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import {Constraint} from "../../../shared/models/constraints/constraint";
import {CombinationConstraint} from "../../../shared/models/constraints/combination-constraint";
import {CombinationState} from "../../../shared/models/constraints/combination-state";

@Component({
  selector: 'constraint',
  templateUrl: './constraint.component.html',
  styleUrls: ['./constraint.component.css']
})
export class ConstraintComponent implements OnInit {
  @Input() constraint: Constraint;
  @Input() isRoot: boolean;
  @Output() constraintRemoved: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  /**
   * Emits the constraintRemoved event, indicating the constraint corresponding
   * to this component is to be removed from its parent.
   */
  remove() {
    this.constraintRemoved.emit();
  }

  /**
   * To determine whether to show the conjunction or disjunction button
   */
  showJunction() {
    let show = false;
    if (this.constraint.parentConstraint) {
      let parentConstraint = <CombinationConstraint>this.constraint.parentConstraint;
      if (parentConstraint.children && parentConstraint.children.length > 1) {
        let index = parentConstraint.children.indexOf(this.constraint);
        if (index < parentConstraint.children.length - 1)
          show = (index < parentConstraint.children.length - 1) ? true : false;
      }
    }
    return show;
  }

  getJunctionName() {
    let name = '';
    if (this.constraint.parentConstraint) {
      let parentConstraint = <CombinationConstraint>this.constraint.parentConstraint;
      name = (parentConstraint.combinationState === CombinationState.And) ? 'and' : 'or';
    }
    return name;
  }

  toggleJunction() {
    if (this.constraint.parentConstraint) {
      let parentConstraint = <CombinationConstraint>this.constraint.parentConstraint;
      parentConstraint.switchCombinationState();
    }
  }

}
