import {Component, OnInit} from '@angular/core';
import {ConstraintComponent} from "../constraint/constraint.component";
import {CombinationConstraint} from "../../../shared/models/constraints/combination-constraint";

@Component({
  selector: 'combination-constraint',
  templateUrl: './combination-constraint.component.html',
  styleUrls: ['./combination-constraint.component.css', '../constraint/constraint.component.css']
})
export class CombinationConstraintComponent extends ConstraintComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit() {
  }

  toggleAndOr() {
    let constraint = <CombinationConstraint>this.constraint;
    constraint.switchCombinationState();
  }

  addRule() {
    console.log('add a constraint other than combination constraint.');
  }

  addRuleSet() {
    console.log('add a combination constraint.');
  }
}
