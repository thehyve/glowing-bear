import {Component, OnInit} from '@angular/core';
import {ConstraintService} from '../../../../services/constraint.service';
import {Concept} from '../../../../models/constraint-models/concept';

@Component({
  selector: 'gb-variables',
  templateUrl: './gb-variables.component.html',
  styleUrls: ['./gb-variables.component.css']
})
export class GbVariablesComponent implements OnInit {

  constructor(private constraintService: ConstraintService) {
  }

  ngOnInit() {
    // TODO: render variables in this compnent in a list, with categories
    console.log('variables', this.variables)
  }

  get variables(): Concept[] {
    return this.constraintService.variables;
  }
}
