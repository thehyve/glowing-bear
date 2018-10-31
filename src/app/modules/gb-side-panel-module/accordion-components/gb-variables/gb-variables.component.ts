import {Component, OnInit} from '@angular/core';
import {ConstraintService} from '../../../../services/constraint.service';
import {Concept} from '../../../../models/constraint-models/concept';
import {ConceptType} from '../../../../models/constraint-models/concept-type';
import {NavbarService} from '../../../../services/navbar.service';

@Component({
  selector: 'gb-variables',
  templateUrl: './gb-variables.component.html',
  styleUrls: ['./gb-variables.component.css']
})
export class GbVariablesComponent implements OnInit {

  private _categorizedVariables: Map<ConceptType, Array<Concept>>;

  public allChecked: boolean;
  public checkAllText: string;

  constructor(private constraintService: ConstraintService,
              private navbarService: NavbarService) {
    this.categorizedVariables = new Map<ConceptType, Array<Concept>>();
    this.constraintService.variablesUpdated.asObservable()
      .subscribe((variables: Concept[]) => {
        this.categorizeVariables(variables);
      });
    this.allChecked = true;
    this.checkAllText = 'All selected';
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
<<<<<<< HEAD
=======
  }

  onCheckAll(e) {
    this.checkAllText = e ? 'All selected' : 'None selected';
    this.checkAll(e);
  }

  private checkAll(b: boolean) {
    this.categorizedVariables.forEach((list: Array<Concept>) => {
      list.forEach((c: Concept) => {
        c.selected = b;
      })
    });
  }

  get isExport(): boolean {
    return this.navbarService.isExport;
>>>>>>> add checkboxes to variables when in export
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