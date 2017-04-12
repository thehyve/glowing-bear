import {Component, OnInit, Input} from '@angular/core';
import {Constraint} from "../../../shared/models/constraints/constraint";

@Component({
  selector: 'constraint',
  templateUrl: './constraint.component.html',
  styleUrls: ['./constraint.component.css']
})
export class ConstraintComponent implements OnInit {
  @Input() constraint: Constraint;

  constructor() {
  }

  ngOnInit() {
  }

  /**
   * call this method when the user clicks the 'remove' button of a constraint component,
   * it removes the component itself from its parent component
   */
  removeSelfComponent() {
    console.log('remove component');
  }

}
