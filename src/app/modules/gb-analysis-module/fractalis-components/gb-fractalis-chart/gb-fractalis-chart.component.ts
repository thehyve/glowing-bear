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
import {ChartValidator} from '../../../../utilities/chart-validator';

@Component({
  selector: 'gb-fractalis-chart',
  templateUrl: './gb-fractalis-chart.component.html',
  styleUrls: ['./gb-fractalis-chart.component.css']
})
export class GbFractalisChartComponent implements AfterViewInit {

  @Input() chart: Chart;
  private fractalisChartDescription: FractalisChartDescription;
  private chartValidator: ChartValidator;
  /**
   * Chart instance retrieved when setting a fractalis chart
   * To be passed to fractalis chart related functions
    */
  private fractalisChartObj: object;

  constructor(private fractalisService: FractalisService) {
    this.chartValidator = new ChartValidator();
  }

  ngAfterViewInit() {
    this.initializeChart();
  }

  private initializeChart() {
    if (this.chart.type !== ChartType.CROSSTABLE) {
      this.fractalisChartObj = this.fractalisService.setChart('#' + this.chart.id);
      this.fractalisService.F.getChartParameterDescriptions(this.fractalisChartObj,
        (description: FractalisChartDescription) => {
          this.fractalisChartDescription = description;
          this.chartValidator.updateValidationCriteria(description.catVars, description.numVars);
          console.log(`Chart ${this.chart.id}`, this.fractalisChartDescription);
          this.setVariablesIfValid();
        },
        (err) => console.error(`Failed to add a chart with id ${this.chart.id}. ${err}`)
      );
    }
    console.log(`Added a new chart with id ${this.chart.id}`);
  }

  setVariablesIfValid() {
    if (this.fractalisChartVariablesNotSet) {
      if (this.chartValidator.isNumberOfVariablesValid(this.chart)) {
        this.setVariables();
      } else {
        this.chart.isValid = false;
        this.fractalisService.invalidateVariables(this.chartValidator.errorMessage);
      }
    }
  }

  private setVariables() {
    this.getLoadedVariables().then(data => {
      if (data) {
        let selectedVariablesMap: Map<string, string[]> = this.prepareVariables(data['data']['data_states']);
        this.setFractalisChartParameters(selectedVariablesMap);
      }
    })
      .catch(err => {
        console.error(`Failed to set variables for a chart with id ${this.chart.id}. ${err}`);
      });
  }

  private setFractalisChartParameters(selectedVariablesMap: Map<string, string[]>) {
    if (selectedVariablesMap !== null) {
      this.fractalisService.F.setChartParameters(this.fractalisChartObj, (
        {
          ['numVars']: selectedVariablesMap.get('numVars'),
          ['catVars']: selectedVariablesMap.get('catVars')
        }));
    }
  }

  private get fractalisChartVariablesNotSet(): boolean {
    return (!this.fractalisChartDescription.catVars || this.fractalisChartDescription.catVars.value.length === 0) &&
      (!this.fractalisChartDescription.numVars || this.fractalisChartDescription.numVars.value.length === 0);
  }

  private getLoadedVariables(): Promise<object> {
    return this.fractalisService.getLoadedVariables();
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
    let selectedVariableCodes = selectedVariables.map((variable: Concept) => variable.code);
    return this.namesToFractalisVariableId(fractalisVariables, selectedVariableCodes);
  }

  private namesToFractalisVariableId(fractalisVariables: FractalisData[], selectedVars: string[]): string[] {
    let fractalisVariableIds: string[] = [];
    selectedVars.forEach(varLabel => {
      let validSelectedVariableIds = fractalisVariables
        .filter(fVar => fVar.label === varLabel && fVar.task_id !== null)
        .map(fVar => this.toExternalVariableId(fVar.task_id));
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

  get chartSize(): string {
    return this.fractalisService.chartDivSize + 'em';
  }

}
