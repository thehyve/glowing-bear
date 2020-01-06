import { Component, OnInit } from '@angular/core';
import {ChartService} from '../../../services/chart.service';
import {ConfirmationService, SelectItem} from 'primeng/api';
import {CohortService} from '../../../services/cohort.service';
import {Cohort} from '../../../models/cohort-models/cohort';

@Component({
  selector: 'gb-chart-settings',
  templateUrl: './gb-chart-settings.component.html',
  styleUrls: ['./gb-chart-settings.component.css']
})
export class GbChartSettingsComponent implements OnInit {

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

  onSelectionChange(){
    this.chartService.updateSelectedCohortsCounts();
  }

  private resetCohortSelection() {
    this.chartService.chartSelected = null;
    this.chartService.selectedCohortIds = null;
    this.chartService.chartVariablesTree = [];
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
    return this.chartService.cohortItems;
  }

  get selectedCohorts(): string[] {
    return this.chartService.selectedCohortIds;
  }

  set selectedCohorts(value: string[]) {
    this.chartService.selectedCohortIds = value;
  }

  get isChartSelected(): boolean {
    return this.chartService.chartSelected !== null;
  }

  set isChartSelected(value: boolean) {
    if (!value) {
      this.chartService.chartSelected = null;
    }
  }

}
