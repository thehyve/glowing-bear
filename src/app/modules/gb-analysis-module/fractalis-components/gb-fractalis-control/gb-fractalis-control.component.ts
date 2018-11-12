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
    this.fractalisService.addChart();
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

  onDropVariable() {
    this.dragCounter = 0;
    this.selectedVariables.push(this.constraintService.draggedVariable);
  }

  onRemoveVariable(variable) {
    const index = this.selectedVariables.indexOf(variable);
    if (index >= 0) {
      this.selectedVariables.splice(index, 1);
    }
  }

  onClearControl() {
    this.selectedChartType = null;
    this.selectedVariables.length = 0;
  }

  get isDropZoneShown(): boolean {
    return (this.selectedChartType && this.selectedChartType !== ChartType.CROSSTABLE);
  }

  get isAddButtonShown(): boolean {
    // TODO: determine the conditions for each type of chart, what variables are needed
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
}
