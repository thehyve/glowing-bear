/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Component, OnInit} from '@angular/core';
import {FractalisService} from '../../../../services/fractalis.service';
import {SelectItem} from 'primeng/api';
import {ChartType} from '../../../../models/chart-models/chart-type';
import {Concept} from '../../../../models/constraint-models/concept';
import {Subject} from 'rxjs';
import {VariableService} from '../../../../services/variable.service';

@Component({
  selector: 'gb-fractalis-control',
  templateUrl: './gb-fractalis-control.component.html',
  styleUrls: ['./gb-fractalis-control.component.css']
})
export class GbFractalisControlComponent implements OnInit {

  dragCounter = 0;

  constructor(private fractalisService: FractalisService,
              private variableService: VariableService) {
  }

  ngOnInit() {
  }

  onAddChart() {
    this.fractalisService.addOrRecreateChart();
  }

  onDragEnter(e: DragEvent) {
    if (this.dragCounter < 0) {
      this.dragCounter = 0;
    }
    this.dragCounter++;
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.dragCounter--;
  }

  onDropVariable(e: DragEvent) {
    e.preventDefault();
    this.dragCounter = 0;
    this.fractalisService.clearValidation();
    let variable = this.variableService.identifyDraggedElement();
    if (variable) {
      this.selectedVariables.push(variable);
      this.selectedVariablesUpdated.next(this.selectedVariables);
    }
  }

  onRemoveVariable(variable) {
    this.fractalisService.clearValidation();
    const index = this.selectedVariables.indexOf(variable);
    if (index >= 0) {
      this.selectedVariables.splice(index, 1);
      this.selectedVariablesUpdated.next(this.selectedVariables);
    }
  }

  onClearControl() {
    this.selectedChartType = null;
    this.selectedVariables.length = 0;
    this.fractalisService.removePreviousChartIfInvalid();
    this.fractalisService.clearValidation();
    this.fractalisService.clearCache();
  }

  onSelectedChartTypeChange() {
    this.selectedVariables.length = 0;
    this.fractalisService.removePreviousChartIfInvalid();
    this.fractalisService.clearValidation();
  }

  get isDropZoneShown(): boolean {
    return (this.selectedChartType && this.selectedChartType !== ChartType.CROSSTABLE);
  }

  get isAddButtonShown(): boolean {
    let shown = false;
    if (this.selectedChartType) {
      if (this.selectedChartType === ChartType.CROSSTABLE) {
        // only enable adding a cross table if there is not one already.
        shown = !this.fractalisService.charts.some(chart => chart.type === ChartType.CROSSTABLE);
      } else if (this.selectedVariables.length > 0) {
        shown = true;
      }
    }
    return shown;
  }

  get isClearButtonShown(): boolean {
    return this.fractalisService.isFractalisEnabled && !!this.selectedChartType;
  }

  get selectedChartType(): ChartType {
    return this.fractalisService.selectedChartType;
  }

  set selectedChartType(value: ChartType) {
    this.fractalisService.selectedChartType = value;
  }

  get availableChartTypes(): SelectItem[] {
    return this.fractalisService.availableChartTypes;
  }

  get variablesDragDropScope(): string {
    return this.variableService.variablesDragDropScope;
  }

  get selectedVariables(): Concept[] {
    return this.fractalisService.selectedVariables;
  }

  get selectedVariablesUpdated(): Subject<Concept[]> {
    return this.fractalisService.selectedVariablesUpdated;
  }

  get isPreparingCache(): boolean {
    return this.fractalisService.isPreparingCache;
  }

  get isValidationError(): boolean {
    return this.selectedChartType != null && this.fractalisService.variablesInvalid;
  }

  get validationErrorMessages(): string[] {
    return this.fractalisService.variablesValidationMessages;
  }

  get isClearingCache(): boolean {
    return this.fractalisService.isClearingCache;
  }
}
