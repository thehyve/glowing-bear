import {Component, OnInit} from '@angular/core';
import {ChartService} from '../../../services/chart.service';
import {ConfirmationService, SelectItem} from 'primeng/api';
import {CohortService} from '../../../services/cohort.service';
import {FractalisService} from '../../../services/fractalis.service';
import {Cohort} from '../../../models/cohort-models/cohort';

@Component({
  selector: 'gb-chart-settings',
  templateUrl: './gb-chart-settings.component.html',
  styleUrls: ['./gb-chart-settings.component.css']
})
export class GbChartSettingsComponent implements OnInit {

  constructor(private chartService: ChartService,
              private fractalisService: FractalisService,
              private cohortService: CohortService,
              private confirmationService: ConfirmationService) {
  }

  ngOnInit() {
  }

  onCancel() {
    this.confirmCancellation();
  }

  onFinish() {
    this.addChart();
    this.resetChartSettings();
  }

  private addChart() {
    console.log('Subsets: ' + this.selectedCohorts);
    this.fractalisService.setSubsets(this.selectedCohorts);
    this.chartService.addOrRecreateChart();
  }

  onSelectionChange(){
    this.chartService.updateSelectedCohortsCounts();
  }

  private resetChartSettings() {
    this.isChartSelected = false;
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
        this.resetChartSettings();
      },
      reject: () => {
      }
    });
  }

  get chartSelected(): string {
    return this.chartService.selectedChartType;
  }

  get cohorts(): SelectItem[] {
    return this.chartService.cohortItems;
  }

  get selectedCohorts(): Cohort[] {
    return this.chartService.selectedCohorts;
  }

  get selectedCohortIds(): string[] {
    return this.chartService.selectedChartCohortIds;
  }

  set selectedCohortIds(value: string[]) {
    this.chartService.currentChart.cohortIds = value;
  }

  get isChartSelected(): boolean {
    return this.chartService.selectedChartType !== null;
  }

  set isChartSelected(value: boolean) {
    if (!value) {
      this.chartService.currentChart = null;
    }
  }

}
