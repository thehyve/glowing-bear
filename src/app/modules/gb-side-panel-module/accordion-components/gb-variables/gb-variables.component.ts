import {Component, OnInit} from '@angular/core';
import {ConstraintService} from '../../../../services/constraint.service';
import {Concept} from '../../../../models/constraint-models/concept';
import {ConceptType} from '../../../../models/constraint-models/concept-type';

@Component({
  selector: 'gb-variables',
  templateUrl: './gb-variables.component.html',
  styleUrls: ['./gb-variables.component.css']
})
export class GbVariablesComponent implements OnInit {
  private _categorizedVariables: Map<ConceptType, Array<Concept>>;

  constructor(private constraintService: ConstraintService) {
    this.categorizedVariables = new Map<ConceptType, Array<Concept>>();
    this.constraintService.variablesUpdated.asObservable()
      .subscribe((variables: Concept[]) => {
        this.categorizeVariables(variables);
      });
  }

  ngOnInit() {
  }

  private categorizeVariables(variables: Concept[]) {
    this.categorizedVariables.clear();
    variables.forEach((variable: Concept) => {
      if (this.categorizedVariables.has(variable.type)) {
        this.categorizedVariables.get(variable.type).push(variable);
      } else {
        this.categorizedVariables.set(variable.type, []);
        this.categorizedVariables.get(variable.type).push(variable);
      }
    });
    console.log('categorized variables: ', this.categorizedVariables);
  }

  get availableVariableTypes(): ConceptType[] {
    return Array.from(this.categorizedVariables.keys());
  }

  get variablesDragDropScope(): string {
    return this.constraintService.variablesDragDropScope;
  }

  get categorizedVariables(): Map<ConceptType, Array<Concept>> {
    return this._categorizedVariables;
  }

  set categorizedVariables(value: Map<ConceptType, Array<Concept>>) {
    this._categorizedVariables = value;
  }
}
