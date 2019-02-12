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


  constructor(private constraintService: ConstraintService,
              private navbarService: NavbarService) {
  }

  ngOnInit() {
  }

  onDragStart(e, concept) {
    this.constraintService.draggedVariable = concept;
  }

  onCheck(e, concept) {
    this.constraintService.selectedVariablesUpdated.next(this.constraintService.variables);
  }

  get isExport(): boolean {
    return this.navbarService.isExport;
  }

  get variablesDragDropScope(): string {
    return this.constraintService.variablesDragDropScope;
  }

  get categorizedVariables(): Array<CategorizedVariable> {
    return this.constraintService.categorizedVariables;
  }
}
