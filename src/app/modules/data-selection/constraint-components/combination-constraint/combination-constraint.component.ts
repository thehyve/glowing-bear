import {Component, OnInit} from '@angular/core';
import {ConstraintComponent} from "../constraint/constraint.component";
import {CombinationConstraint} from "../../../shared/models/constraints/combination-constraint";
import {Constraint} from "../../../shared/models/constraints/constraint";
import {AutoCompleteModule} from 'primeng/components/autocomplete/autocomplete';

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

  /**
   * Removes the childConstraint from the CombinationConstraint corresponding to this component.
   * @param childConstraint
   */
  onConstraintRemoved(childConstraint:Constraint) {
    (<CombinationConstraint>this.constraint).removeChildConstraint(childConstraint);
  }


  text: string;

  results: string[];

  search(event) {
    this.results = ['segseg', 'aaaa', 'test'];
    /*this.mylookupservice.getResults(event.query).then(data => {
      this.results = data;
    });*/
  }

}
