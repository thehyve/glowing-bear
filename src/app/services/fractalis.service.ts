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
import {AppConfig} from '../config/app.config';
import {FractalisData} from '../models/fractalis-models/fractalis-data';
import {FractalisEtlState} from '../models/fractalis-models/fractalis-etl-state';

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
  private _conceptCodeToFractalisTaskId: Map<string, string>;

  static dataObjectToFractalisDataList(data: any):  FractalisData[] {
    return data['data']['data_states'];
  }

  constructor(private appConfig: AppConfig,
              private authService: AuthenticationService,
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
      dataSource: this.appConfig.getConfig('api-url'),
      fractalisNode: this.appConfig.getConfig('fractalis-url'),
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
        const fractalisConstraint = {
          type: 'concept',
          conceptCode: variable.code
        };
        const type = this.mapConceptTypeToFractalisVariableType(variable.type);
        if (!type) {
          console.error(`Failed to load variable: ${variable.code}. Invalid type: ${variable.type}.`);
          return;
        }
        const descriptor = {
          constraint: JSON.stringify(fractalisConstraint),
          data_type: type,
          label: variable.code
        };

        this.F.loadData([descriptor])
          .then(res => {
            // TODO proper loading status update
          })
          .catch(err => {
            console.error(`Failed to load variable: ${variable.code}`);
            console.error(err)
          });
      }
    );
    this.isPreparingCache = false;
  }

  getLoadedVariables(): Promise<object> {
    return this.F.getTrackedVariables();
  }
  setSubsets() {
    // TODO make use of this function
    // this.F.setSubsets([])
  }

  private clearData() {
    this.F.clearCache();
  }

  private mapConceptTypeToFractalisVariableType(type: ConceptType): string {
    switch (type) {
      case ConceptType.NUMERICAL: {
        return 'numerical';
      }
      case ConceptType.HIGH_DIMENSIONAL: {
        return 'numerical_array';
      }
      case ConceptType.CATEGORICAL:
      case ConceptType.DATE: {
        return 'categorical';
      }
      default: {
        return ''
      }
    }
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

  public invalidateVariables(errorMessage: string) {
    this.variablesValidationMessage = errorMessage;
    this.variablesInvalid = true;
  }

  public clearValidation() {
    this.variablesValidationMessage = '';
    this.variablesInvalid = false;
  }

  public validateVariableUploadStatus(variable: Concept): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.getLoadedVariables().then(dataObj => {
        let message = '';
        if (dataObj) {
          let fractalisDataList: FractalisData[] = FractalisService.dataObjectToFractalisDataList(dataObj);
          let fractalisVars = fractalisDataList.filter(data => data.label === variable.code);
          if (fractalisVars) {
            switch (fractalisVars[0].etl_state) {
              case FractalisEtlState.SUCCESS: {
                resolve(true);
                return;
              }
              case FractalisEtlState.SUBMITTED: {
                message = 'Uploading into Fractalis in progress. Please try again later.';
                break;
              }
              case FractalisEtlState.FAILURE: {
                message =  'Variable was not loaded correctly into Fractalis.';
                break;
              }
              default:
                message = 'Invalid variable upload status: ' + fractalisVars[0].etl_state;
                break;
            }
          } else {
            message = 'Variable was not loaded into Fractalis.';
          }
        } else {
          message = 'No data loaded into Fractalis.';
        }
        MessageHelper.alert('error', 'The variable cannot be selected. ' + message);
        resolve(false);
      }).catch(err => {
        reject(err);
      })
    });
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

  get conceptCodeToFractalisTaskId(): Map<string, string> {
    return this._conceptCodeToFractalisTaskId;
  }

  set conceptCodeToFractalisTaskId(value: Map<string, string>) {
    this._conceptCodeToFractalisTaskId = value;
  }

}
