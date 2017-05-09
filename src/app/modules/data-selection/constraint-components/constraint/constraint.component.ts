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

}
