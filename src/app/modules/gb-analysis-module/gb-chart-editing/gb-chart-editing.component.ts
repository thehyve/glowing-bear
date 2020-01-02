import { Component, OnInit } from '@angular/core';
import {ChartService} from '../../../services/chart.service';
import {ConfirmationService, SelectItem} from 'primeng/api';
import {CohortService} from '../../../services/cohort.service';
import {Cohort} from '../../../models/cohort-models/cohort';

@Component({
  selector: 'gb-chart-editing',
  templateUrl: './gb-chart-editing.component.html',
  styleUrls: ['./gb-chart-editing.component.css']
})
export class GbChartEditingComponent implements OnInit {

  constructor(private chartService: ChartService,
              private cohortService: CohortService,
              private confirmationService: ConfirmationService) { }

  ngOnInit() {
  }

  onCancel() {
    this.confirmCancellation();
  }

  onFinish() {
    //TODO create chart
    this.resetCohortSelection();
  }

  private resetCohortSelection() {
    this.chartService.chartSelected = null;
    this.chartService.cohortsSelected = null;
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
        this.resetCohortSelection();
      },
      reject: () => {
      }
    });
  }

  get chartSelected(): string {
    return this.chartService.chartSelected;
  }

  get cohorts(): SelectItem[] {
    return this.chartService.cohorts;
  }

  get selectedCohorts(): SelectItem[] {
    return this.chartService.cohortsSelected;
  }

  set selectedCohorts(value: SelectItem[]) {
    this.chartService.cohortsSelected = value;
  }

}
