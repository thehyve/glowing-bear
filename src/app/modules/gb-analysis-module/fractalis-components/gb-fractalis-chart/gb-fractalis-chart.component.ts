/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {AfterViewInit, Component, Input} from '@angular/core';
import {Chart} from '../../../../models/chart-models/chart';
import {ChartType} from '../../../../models/chart-models/chart-type';
import {FractalisService} from '../../../../services/fractalis.service';
import {FractalisChartDescription} from '../../../../models/fractalis-models/fractalis-chart-description';
import {FractalisData} from '../../../../models/fractalis-models/fractalis-data';
import {Concept} from '../../../../models/constraint-models/concept';
import {ChartValidationHelper} from '../../../../utilities/chart-validation-helper';

@Component({
  selector: 'gb-fractalis-chart',
  templateUrl: './gb-fractalis-chart.component.html',
  styleUrls: ['./gb-fractalis-chart.component.css']
})
export class GbFractalisChartComponent implements AfterViewInit {

  @Input() chart: Chart;
  private fractalisChartDescription: FractalisChartDescription;
  private fractalisChart: object;
  private chartValidator: ChartValidationHelper;

  constructor(private fractalisService: FractalisService) {
    this.chartValidator = new ChartValidationHelper();
  }

  ngAfterViewInit() {
    this.initializeChart();
  }

  private initializeChart() {
    if (this.chart.type !== ChartType.CROSSTABLE) {
      this.fractalisChart = this.fractalisService.setChart('#' + this.chart.id);
      this.fractalisService.F.getChartParameterDescriptions(this.fractalisChart, (description: FractalisChartDescription) => {
          this.fractalisChartDescription = description;
          this.chartValidator.updateValidationCriteria(description.catVars, description.numVars);
          console.log(`Chart ${this.chart.id}`, this.fractalisChartDescription);
          this.setVariablesIfValid();
        },
        (err) => console.log(`Failed to add a chart with id ${this.chart.id}. ${err}`)
      );
    }
    console.log(`Added a new chart with id ${this.chart.id}`);
  }

  private setVariablesIfValid() {
    if (this.chartValidator.isNumberOfVariablesValid(this.chart)) {
      if (this.fractalisChartVariablesNotSet()) {
        this.setVariables();
      }
    } else {
      this.chart.isValid = false;
      this.fractalisService.setVariablesInvalid(this.chartValidator.errorMessage);
    }
  }

  private setVariables() {
    this.getLoadedVariables().then(data => {
      if (data) {
        let selectedVariablesMap: Map<string, string[]> = this.prepareVariables(data['data']['data_states']);
        if (selectedVariablesMap !== null) {
          this.fractalisService.F.setChartParameters(this.fractalisChart, (
            {
              ['numVars']: selectedVariablesMap.get('numVars'),
              ['catVars']: selectedVariablesMap.get('catVars')
            }));
        }
      }
    })
      .catch(err => {
        console.log(`Failed to set variables for a chart with id ${this.chart.id}. ${err}`);
      });
  }

  private fractalisChartVariablesNotSet() {
    return (!this.fractalisChartDescription.catVars || this.fractalisChartDescription.catVars.value.length === 0) &&
      (!this.fractalisChartDescription.numVars || this.fractalisChartDescription.numVars.value.length === 0);
  }

  private getLoadedVariables(): Promise<object> {
    return this.fractalisService.F.getTrackedVariables()
  }

  private prepareVariables(fractalisVariables: FractalisData[]): Map<string, string[]> {
    let variablesMap = new Map<string, string[]>();
    if (fractalisVariables.length > 0) {
      variablesMap.set('numVars', this.getVariablesOfType(fractalisVariables, this.chart.numericalVariables));
      variablesMap.set('catVars', this.getVariablesOfType(fractalisVariables, this.chart.categoricalVariables));
    }
    return variablesMap;
  }

  private getVariablesOfType(fractalisVariables: FractalisData[], selectedVariables: Concept[]) {
    let selectedVariableNames = selectedVariables.map((variable: Concept) => variable.name);
    return this.namesToFractalisVariableId(fractalisVariables, selectedVariableNames);
  }

  private namesToFractalisVariableId(fractalisVariables: FractalisData[], selectedVars: string[]): string[] {
    let fractalisVariableIds: string[] = [];
    selectedVars.forEach(varLabel => {
      let validSelectedVariableIds = fractalisVariables
        .filter(x => x.label === varLabel && x.task_id !== null)
        .map(v => this.toExternalVariableId(v.task_id));
      fractalisVariableIds.push(...validSelectedVariableIds);
    });
    return fractalisVariableIds;
  }

  private toExternalVariableId(task_id: string): string {
    // this is the variable representation format expected by fractal.js
    return `\${\"id\":\"${task_id}\",\"filters\":{}}\$`;
  }

  get ChartType() {
    return ChartType;
  }

}
