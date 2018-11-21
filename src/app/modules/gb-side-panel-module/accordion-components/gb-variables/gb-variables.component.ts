import {Component, OnInit} from '@angular/core';
import {ConstraintService} from '../../../../services/constraint.service';
import {Concept} from '../../../../models/constraint-models/concept';
import {CategorizedVariable} from '../../../../models/constraint-models/categorized-variable';
import {NavbarService} from '../../../../services/navbar.service';
import {DataTableService} from '../../../../services/data-table.service';

@Component({
  selector: 'gb-variables',
  templateUrl: './gb-variables.component.html',
  styleUrls: ['./gb-variables.component.css']
})
export class GbVariablesComponent implements OnInit {

  private _categorizedVariables: Array<CategorizedVariable> = [];

  public allChecked: boolean;
  public checkAllText: string;

  constructor(private constraintService: ConstraintService,
              private dataTableService: DataTableService,
              private navbarService: NavbarService) {
    this.constraintService.variablesUpdated.asObservable()
      .subscribe((variables: Concept[]) => {
        this.categorizeVariables(variables);
      });

    this.allChecked = true;
  }

  ngOnInit() {
  }

  private categorizeVariables(variables: Concept[]) {
    this.categorizedVariables.length = 0;
    variables.forEach((variable: Concept) => {
      let existingVariable = this.categorizedVariables.filter(x => x.type == variable.type)[0];
      if (existingVariable) {
        existingVariable.elements.push(variable);
      } else {
        this.categorizedVariables.push({type: variable.type, elements: [variable]});
      }
    });
    this.updateCheckAllText();
  }

  updateCheckAllText() {
    let numSelected = 0;
    this.categorizedVariables.forEach((catVar: CategorizedVariable) => {
      catVar.elements.forEach((c: Concept) => {
        if (c.selected) {
          numSelected++;
        }
      });
    });
    this.checkAllText = numSelected === 1 ?
      `${numSelected} variable selected` : `${numSelected} variables selected`;
  }

  checkVariables() {
    this.dataTableService.isDirty = true;
    this.updateCheckAllText();
  }

  checkAll(b: boolean) {
    this.categorizedVariables.forEach((catVar: CategorizedVariable) => {
      catVar.elements.forEach((c: Concept) => {
        c.selected = b;
      })
    });
    this.checkVariables();
  }

  onDragStart(e, concept) {
    this.constraintService.draggedVariable = concept;
  }

  get isExport(): boolean {
    return this.navbarService.isExport;
  }

  get variablesDragDropScope(): string {
    return this.constraintService.variablesDragDropScope;
  }

  get categorizedVariables(): Array<CategorizedVariable> {
    return this._categorizedVariables;
  }

  set categorizedVariables(value: Array<CategorizedVariable>) {
    this._categorizedVariables = value;
  }
}
