import {Component, OnInit} from '@angular/core';
import {CategorizedVariable} from '../../../../../models/constraint-models/categorized-variable';
import {ConstraintService} from '../../../../../services/constraint.service';
import {Concept} from '../../../../../models/constraint-models/concept';
import {NavbarService} from '../../../../../services/navbar.service';
import {DataTableService} from '../../../../../services/data-table.service';

@Component({
  selector: 'gb-categorized-variables',
  templateUrl: './gb-categorized-variables.component.html',
  styleUrls: ['./gb-categorized-variables.component.css']
})
export class GbCategorizedVariablesComponent implements OnInit {

  public allChecked: boolean;

  private _categorizedVariables: Array<CategorizedVariable> = [];

  constructor(private constraintService: ConstraintService,
              private navbarService: NavbarService,
              private dataTableService: DataTableService) {
    this.allChecked = true;
    this.categorizeVariables(this.constraintService.variables);
    this.constraintService.variablesUpdated.asObservable()
      .subscribe((variables: Concept[]) => {
        this.checkAll(true);
        this.categorizeVariables(variables);
      });
  }

  ngOnInit() {
    this.checkAll(true);
  }

  private categorizeVariables(variables: Concept[]) {
    this.categorizedVariables.length = 0;
    variables.forEach((variable: Concept) => {
      let existingVariable = this.categorizedVariables.filter(x => x.type === variable.type)[0];
      if (existingVariable) {
        existingVariable.elements.push(variable);
      } else {
        this.categorizedVariables.push({type: variable.type, elements: [variable]});
      }
    });
  }

  onDragStart(e, concept) {
    this.constraintService.draggedVariable = concept;
  }

  checkVariables() {
    this.dataTableService.isDirty = true;
  }

  checkAll(b: boolean) {
    this.categorizedVariables.forEach((catVar: CategorizedVariable) => {
      catVar.elements.forEach((c: Concept) => {
        c.selected = b;
      })
    });
    this.checkVariables();
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

  get checkAllText(): string {
    let numSelected = this.numberOfSelected;
    return numSelected === 1 ?
      `${numSelected} variable selected` : `${numSelected} variables selected`;
  }

  get numberOfSelected(): number {
    return this.constraintService.variables.filter(v =>
      v.selected === true).length;
  }
}
