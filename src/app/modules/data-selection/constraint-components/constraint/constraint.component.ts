import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import {Constraint} from "../../../shared/models/constraints/constraint";

@Component({
  selector: 'constraint',
  templateUrl: './constraint.component.html',
  styleUrls: ['./constraint.component.css']
})
export class ConstraintComponent implements OnInit {
  @Input() constraint: Constraint;
  @Output()
  constraintRemoved: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  ngOnInit() { console.log('----- constraint: ', this.constraint,' and its type: ', this.constraint.getConstraintType());
  }

  /**
   * Emits the constraintRemoved event, indicating the constraint corresponding
   * to this component is to be removed from its parent.
   */
  remove() {
    this.constraintRemoved.emit();
  }

}
