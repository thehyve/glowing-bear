import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication/authentication.service';
import * as fjs from 'fractalis';
import {MessageHelper} from '../utilities/message-helper';
import {ChartType} from '../models/chart-models/chart-type';
import {Chart} from '../models/chart-models/chart';
import {SelectItem} from 'primeng/api';
import {Concept} from '../models/constraint-models/concept';
import {ConceptType} from '../models/constraint-models/concept-type';
import {ConstraintService} from './constraint.service';

@Injectable({
  providedIn: 'root'
})
export class FractalisService {

  private _F: any; // The fractalis object
  private _availableChartTypes: SelectItem[] = [];
  private _selectedChartType: ChartType = null;
  private _charts: Chart[] = [];
  private _selectedVariables: Concept[] = [];
  private _isPreparingCache = true;
  private _variablesInvalid = false;
  private _variablesValidationMessage: string;

  constructor(private authService: AuthenticationService,
              private constraintService: ConstraintService) {
    if (fjs.fractalis) {
      this.setupFractalis();
      this.retrieveAvailableChartTypes();
      this.constraintService.variablesUpdated.asObservable()
        .subscribe((variables: Concept[]) => {
          this.clearData();
          this.prepareCache(variables);
        });
    } else {
      MessageHelper.alert('error', 'Failed to import Fractalis.');
    }
  }

  private setupFractalis() {
    let token = this.authService.token;
    const config = {
      handler: 'transmart',
      dataSource: 'http://172.19.0.1:8081',
      fractalisNode: 'http://localhost:5000',
      getAuth() {
        return {token: token}
      },
      options: {
        controlPanelPosition: 'right',
        controlPanelExpanded: true,
        controlPanelHidden: false,
        showDataBox: false
      }
    };
    this.F = fjs.fractalis.init(config);
    console.log('Fractalis imported: ', this.availableChartTypes);

    this.clearData();
    this.prepareCache(this.constraintService.variables);
  }

  private prepareCache(variables: Concept[]) {
    this.isPreparingCache = true;
    variables.forEach((variable: Concept) => {
        const constraint = {
          type: 'concept',
          conceptCode: variable.code
        };
        const descriptor = {
          constraint: JSON.stringify(constraint),
          data_type: variable.type === ConceptType.NUMERICAL ? 'numerical' : 'categorical',
          label: variable.name
        };

        this.F.loadData([descriptor])
          .then(res => {
            // TODO proper loading status update
          })
          .catch(err => {
            console.log(`Failed to load variable: ${variable.code}`);
            console.log(err)
          });
      }
    );
    this.isPreparingCache = false;
  }

  setSubsets() {
    // TODO make use of this function
    // this.F.setSubsets([])
  }

  private clearData() {
    this.F.clearCache();
  }

  getLoadedVariables(): Promise<object> {
    return this.F.getTrackedVariables();
  }

  setChart(chartId: string): object {
    return this.F.setChart(this.selectedChartType, chartId);
  }

  private retrieveAvailableChartTypes() {
    const types: string[] = this.F.getAvailableCharts();
    types.forEach((t: string) => {
      const type = <ChartType>t.toLowerCase();
      this.availableChartTypes.push({
        label: type,
        value: type
      });
    });
    this.availableChartTypes.push({
      label: ChartType.CROSSTABLE,
      value: ChartType.CROSSTABLE
    });
  }

  public addOrRecreateChart() {
    if (this.previousChart && !this.previousChart.isValid) {
      this.removeChart(this.previousChart);
    }
    this.addChart();
  }

  public addChart() {
    if (this.selectedChartType) {
      let chart = new Chart(this.selectedChartType);
      chart.variables = [...this.selectedVariables]; // clone a new array
      this.charts.push(chart);
    }
  }

  public removeChart(chart: Chart) {
    this.charts.splice(this.charts.indexOf(chart), 1);
  }

  public setVariablesInvalid(errorMessage: string) {
    this.variablesValidationMessage = errorMessage;
    this.variablesInvalid = true;
  }

  public clearValidation() {
    this.variablesValidationMessage = '';
    this.variablesInvalid = false;
  }

  get previousChart(): Chart {
    return this.charts[this.charts.length - 1];
  }

  get availableChartTypes(): SelectItem[] {
    return this._availableChartTypes;
  }

  set availableChartTypes(value: SelectItem[]) {
    this._availableChartTypes = value;
  }

  get selectedChartType(): ChartType {
    return this._selectedChartType;
  }

  set selectedChartType(value: ChartType) {
    this._selectedChartType = value;
  }

  get charts(): Chart[] {
    return this._charts;
  }

  set charts(value: Chart[]) {
    this._charts = value;
  }

  get F(): any {
    return this._F;
  }

  set F(value: any) {
    this._F = value;
  }

  get isPreparingCache(): boolean {
    return this._isPreparingCache;
  }

  set isPreparingCache(value: boolean) {
    this._isPreparingCache = value;
  }

  get selectedVariables(): Concept[] {
    return this._selectedVariables;
  }

  set selectedVariables(value: Concept[]) {
    this._selectedVariables = value;
  }

  get variablesValidationMessage(): string {
    return this._variablesValidationMessage;
  }

  set variablesValidationMessage(value: string) {
    this._variablesValidationMessage = value;
  }
  get variablesInvalid(): boolean {
    return this._variablesInvalid;
  }

  set variablesInvalid(value: boolean) {
    this._variablesInvalid = value;
  }

}
