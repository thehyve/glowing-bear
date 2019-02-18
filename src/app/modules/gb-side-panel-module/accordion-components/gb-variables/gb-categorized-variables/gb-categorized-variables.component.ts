import {Component, OnInit} from '@angular/core';
import {CategorizedVariable} from '../../../../../models/constraint-models/categorized-variable';
import {ConstraintService} from '../../../../../services/constraint.service';
import {NavbarService} from '../../../../../services/navbar.service';
import {VariableService} from '../../../../../services/variable.service';

@Component({
  selector: 'gb-categorized-variables',
  templateUrl: './gb-categorized-variables.component.html',
  styleUrls: ['./gb-categorized-variables.component.css']
})
export class GbCategorizedVariablesComponent implements OnInit {


  constructor(private variableService: VariableService,
              private navbarService: NavbarService) {
  }

  ngOnInit() {
  }

  onDragStart(e, concept) {
    this.variableService.draggedVariable = concept;
  }

  onCheck(e, concept) {
    this.variableService.selectedVariablesUpdated.next(this.variableService.variables);
  }

  get isExport(): boolean {
    return this.navbarService.isExport;
  }

  get variablesDragDropScope(): string {
    return this.variableService.variablesDragDropScope;
  }

  get categorizedVariables(): Array<CategorizedVariable> {
    return this.variableService.categorizedVariables;
  }
}
