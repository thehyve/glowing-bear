import {Component, OnInit} from '@angular/core';
import {ConstraintComponent} from "../constraint/constraint.component";

@Component({
  selector: 'concept-constraint',
  templateUrl: './concept-constraint.component.html',
  styleUrls: ['./concept-constraint.component.css', '../constraint/constraint.component.css']
})
export class ConceptConstraintComponent extends ConstraintComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit() { console.log('concept comp init');
  }

}
