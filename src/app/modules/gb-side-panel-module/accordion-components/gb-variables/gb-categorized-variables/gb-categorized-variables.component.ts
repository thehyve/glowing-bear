/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Component, OnInit} from '@angular/core';
import {CategorizedVariable} from '../../../../../models/constraint-models/categorized-variable';
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
