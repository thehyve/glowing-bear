import {Component, OnInit} from '@angular/core';
import {FractalisService} from '../../../../services/fractalis.service';
import {SelectItem} from 'primeng/api';
import {ChartType} from '../../../../models/chart-models/chart-type';
import {ConstraintService} from '../../../../services/constraint.service';

@Component({
  selector: 'gb-fractalis-control',
  templateUrl: './gb-fractalis-control.component.html',
  styleUrls: ['./gb-fractalis-control.component.css']
})
export class GbFractalisControlComponent implements OnInit {

  dragCounter = 0;

  // TODO: accept drag & drop of variables
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

  onDrop() {
    console.log('drop', this.constraintService.draggedVariable);
    this.dragCounter = 0;
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

  get isDropZoneShown() {
    return (this.selectedChartType && this.selectedChartType !== ChartType.CROSSTABLE);
  }

  get isAddButtonShown() {
    return this.selectedChartType;
  }

  get variablesDragDropScope(): string {
    return this.constraintService.variablesDragDropScope;
  }
}
