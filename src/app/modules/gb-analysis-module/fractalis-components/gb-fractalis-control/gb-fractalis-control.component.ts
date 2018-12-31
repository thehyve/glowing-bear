/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Component, OnInit} from '@angular/core';
import {FractalisService} from '../../../../services/fractalis.service';
import {SelectItem} from 'primeng/api';
import {ChartType} from '../../../../models/chart-models/chart-type';
import {ConstraintService} from '../../../../services/constraint.service';
import {Concept} from '../../../../models/constraint-models/concept';

@Component({
  selector: 'gb-fractalis-control',
  templateUrl: './gb-fractalis-control.component.html',
  styleUrls: ['./gb-fractalis-control.component.css']
})
export class GbFractalisControlComponent implements OnInit {

  dragCounter = 0;

  constructor(private fractalisService: FractalisService,
              private constraintService: ConstraintService) {
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
    let variable = this.constraintService.identifyDraggedElement();
    if (variable) {
      this.fractalisService.validateVariableUploadStatus(variable).then(valid => {
        if (valid) {
          this.selectedVariables.push(variable);
        }
      });
    }
  }

  onRemoveVariable(variable) {
    this.fractalisService.clearValidation();
    const index = this.selectedVariables.indexOf(variable);
    if (index >= 0) {
      this.selectedVariables.splice(index, 1);
    }
  }

  onClearControl() {
    this.fractalisService.clearValidation();
    this.selectedChartType = null;
    this.selectedVariables.length = 0;
  }

  onSelectedChartTypeChange() {
    this.selectedVariables.length = 0;
    this.fractalisService.clearValidation();
  }

  get isDropZoneShown(): boolean {
    return (this.selectedChartType && this.selectedChartType !== ChartType.CROSSTABLE);
  }

  get isAddButtonShown(): boolean {
    let shown = false;
    if (this.selectedChartType) {
      if (this.selectedChartType === ChartType.CROSSTABLE) {
        shown = true;
      } else if (this.selectedVariables.length > 0) {
        shown = true;
      }
    }
    return shown;
  }

  get isClearButtonShown(): boolean {
    return this.selectedChartType ? true : false;
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
    return this.constraintService.variablesDragDropScope;
  }

  get selectedVariables(): Concept[] {
    return this.fractalisService.selectedVariables;
  }

  set selectedVariables(value: Concept[]) {
    this.fractalisService.selectedVariables = value;
  }

  get isPreparingCache(): boolean {
    return this.fractalisService.isPreparingCache;
  }

  get isValidationError(): boolean {
    return this.fractalisService.variablesInvalid;
  }

  get validationErrorMessages(): string[] {
    return this.fractalisService.variablesValidationMessages;
  }
}
