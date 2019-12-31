import { Component, OnInit } from '@angular/core';
import {ChartService} from '../../../services/chart.service';
import {ConfirmationService} from 'primeng/api';

@Component({
  selector: 'gb-chart-editing',
  templateUrl: './gb-chart-editing.component.html',
  styleUrls: ['./gb-chart-editing.component.css']
})
export class GbChartEditingComponent implements OnInit {

  constructor(private chartService: ChartService,
              private confirmationService: ConfirmationService) { }

  ngOnInit() {
  }

  onCancel() {
    this.confirmCancellation();
  }

  onFinish() {
    //TODO create chart
    this.chartService.chartSelected = null;
  }

  confirmCancellation() {
    this.confirmationService.confirm({
      key: 'confirmCancelChart',
      message: 'Canceling the Chart Settings setup will result in deleting all the current settings.',
      header: 'Canceling confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete current settings',
      rejectLabel: 'Back',
      accept: () => {
        this.chartService.chartSelected = null;
        return
      },
      reject: () => {
      }
    });
  }

  get chartSelected(): string {
    return this.chartService.chartSelected;
  }

}
