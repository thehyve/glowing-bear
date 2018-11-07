import {Component, OnInit} from '@angular/core';
import {FractalisService} from '../../../../services/fractalis.service';
import {SelectItem} from 'primeng/api';
import {ChartType} from '../../../../models/chart-models/chart-type';

@Component({
  selector: 'gb-fractalis-control',
  templateUrl: './gb-fractalis-control.component.html',
  styleUrls: ['./gb-fractalis-control.component.css']
})
export class GbFractalisControlComponent implements OnInit {

  public availableChartTypes: SelectItem[];

  // TODO: accept drag & drop of variables
  constructor(private fractalisService: FractalisService) {
  }

  ngOnInit() {
    this.availableChartTypes = [];
    this.fractalisService.availableChartTypes
      .forEach((type: ChartType) => {
        this.availableChartTypes.push({
          label: type,
          value: type
        });
      });
  }

  onChartTypeSelection(e) {
    this.selectedChartType = <ChartType>e.value;
    console.log(e, this.selectedChartType);
  }

  onAddChart() {
    this.fractalisService.addChart();
  }

  get selectedChartType(): ChartType {
    return this.fractalisService.selectedChartType;
  }

  set selectedChartType(value: ChartType) {
    this.fractalisService.selectedChartType = value;
  }

  get isDropZoneShown() {
    return (this.selectedChartType && this.selectedChartType !== ChartType.CROSSTABLE);
  }

  get isAddButtonShown() {
    return this.selectedChartType;
  }
}
