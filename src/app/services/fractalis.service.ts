/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication/authentication.service';
import * as fjs from 'fractalis';
import Timer = NodeJS.Timer;
import {MessageHelper} from '../utilities/message-helper';
import {ChartType} from '../models/chart-models/chart-type';
import {Chart} from '../models/chart-models/chart';
import {SelectItem} from 'primeng/api';
import {Concept} from '../models/constraint-models/concept';
import {ConceptType} from '../models/constraint-models/concept-type';
import {AppConfig} from '../config/app.config';
import {FractalisData} from '../models/fractalis-models/fractalis-data';
import {FractalisEtlState} from '../models/fractalis-models/fractalis-etl-state';
import {FractalisChartDescription} from '../models/fractalis-models/fractalis-chart-description';
import {FractalisChart} from '../models/fractalis-models/fractalis-chart';
import {BehaviorSubject, Observable} from 'rxjs/Rx';
import {FractalisVariablesStatus} from '../models/fractalis-models/fractalis-variables-status';
import {forkJoin, Subject} from 'rxjs';
import {CohortService} from './cohort.service';
import {ResourceService} from './resource.service';
import {TrueConstraint} from '../models/constraint-models/true-constraint';
import {Cohort} from '../models/cohort-models/cohort';
import {TransmartPatient} from '../models/transmart-models/transmart-patient';

@Injectable({
  providedIn: 'root'
})
export class FractalisService {
  static readonly MAX_CACHE_TRYS = 10;
  static readonly TIMEOUT_VARIABLE_STATUS_UPDATE = 3000;

  public F: any; // The fractalis object
  private _availableChartTypes: SelectItem[] = [];
  private _selectedChartType: ChartType = null;
  private _charts: Chart[] = [];
  private _selectedVariables: Concept[] = [];
  private _selectedVariablesUpdated = new Subject<Concept[]>();
  private _isPreparingCache = false;
  private _isClearingCache = false;
  private _currentCacheTrys = 0;
  private _variablesInvalid = false;
  private _variablesValidationMessages: string[];
  private _chartDivSize: number;
  private timer: Timer;
  private _variablesStatus: FractalisVariablesStatus;


  static dataObjectToFractalisDataList(data: any): FractalisData[] {
    return data['data']['data_states'];
  }

  constructor(private appConfig: AppConfig,
              private authService: AuthenticationService,
              private cohortService: CohortService,
              private resourceService: ResourceService) {
    this.chartDivSize = 35;
    const enabled = this.appConfig.getConfig('enable-fractalis-analysis');
    if (enabled && !fjs.fractalis) {
      MessageHelper.alert('error', 'Failed to import Fractalis.');
    } else {
      this.availableChartTypes.push({
        label: ChartType.CROSSTABLE,
        value: ChartType.CROSSTABLE
      });
    }
  }

  public setupFractalis(): Promise<any> {
    let token = this.authService.token;
    let oidcClientId = this.appConfig.getConfig('oidc-client-id');
    let oidcServerUrl = this.appConfig.getConfig('oidc-server-url');
    const config = {
      handler: 'transmart',
      dataSource: this.appConfig.getConfig('fractalis-datasource-url'),
      fractalisNode: this.appConfig.getConfig('fractalis-url'),
      getAuth() {
        return {
          token: token,
          authServiceType: 'oidc',
          oidcClientId: oidcClientId,
          oidcServerUrl: oidcServerUrl,
        }
      },
      options: {
        controlPanelPosition: 'right',
        controlPanelExpanded: true,
        controlPanelHidden: false,
        showDataBox: false
      }
    };
    this.F = fjs.fractalis.init(config);
    this.configSubsetsUpdate();
    this.configVariablesUpdate();
    this.retrieveFractalisChartTypes();
    return this.clearCache();
  }

  public prepareCache(variables: Concept[]) {
    if (variables && variables.length > 0) {
      this.isPreparingCache = true;
      let descriptors = [];
      variables.forEach((variable: Concept) => {
          const type = this.mapConceptTypeToFractalisVariableType(variable.type);
          if (type) {
            const constraintObj = {
              type: 'concept',
              conceptCode: variable.code
            };
            const descriptor = {
              constraint: constraintObj,
              data_type: type,
              label: variable.code
            };
            descriptors.push(descriptor);
          }
        }
      );
      this.F.loadData(descriptors)
        .catch(err => {
          MessageHelper.alert('error', 'Fail to prepare cache.');
          console.error(err)
        });
    }
  }

  public getTrackedVariables(): Promise<object> {
    return this.F.getTrackedVariables();
  }

  public updateVariablesStatus(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getTrackedVariables().then(dataObj => {
        let successCount = 0;
        let submittedCount = 0;
        let failureCount = 0;
        const fractalisDataList: FractalisData[] = FractalisService.dataObjectToFractalisDataList(dataObj);
        fractalisDataList.forEach((data: FractalisData) => {
          switch (data.etl_state) {
            case FractalisEtlState.SUCCESS: {
              successCount++;
              break;
            }
            case FractalisEtlState.SUBMITTED: {
              submittedCount++;
              break;
            }
            case FractalisEtlState.FAILURE: {
              failureCount++;
              break;
            }
          }
        });
        this._variablesStatus = {successCount, submittedCount, failureCount};
        this.isPreparingCache = submittedCount > 0;
        console.log(this.variablesStatus);
        resolve(true);
      }).catch(err => {
        console.error('Failed to fetch tracked variables from Fractalis.');
        console.error(err);
        reject(err);
      });
    });
  }

  private configSubsetsUpdate() {
    this.cohortService.cohortsUpdated.asObservable()
      .subscribe((cohorts: Cohort[]) => {
        let subjectCalls = [];
        cohorts
          .filter((cohort: Cohort) => {
            return cohort.selected;
          })
          .forEach((cohort: Cohort) => {
            subjectCalls.push(this.resourceService.getSubjects(cohort.constraint));
          });
        let idSets = [];
        forkJoin(subjectCalls)
          .subscribe(res => {
            for (let i = 0; i < subjectCalls.length; i++) {
              const ids = res[i].map((subject: TransmartPatient) => {
                return subject.subjectIds.SUBJ_ID;
              });
              idSets.push(ids);
            }
            this.F.setSubsets(idSets);
          });
      });
  }

  private configVariablesUpdate() {
    this.selectedVariablesUpdated.asObservable().subscribe(variables => {
      this.prepareCache(variables);
    });
    this.timer = setInterval(() =>
      this.updateVariablesStatus(), FractalisService.TIMEOUT_VARIABLE_STATUS_UPDATE);
  }

  public clearCache(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.isClearingCache = true;
      this.F.clearCache()
        .then(res => {
          this.isClearingCache = false;
          this._currentCacheTrys = 0;
          resolve(true);
        })
        .catch(error => {
          console.error(`Error clearing Fractalis cache: ${error}`);
          if (this._currentCacheTrys < FractalisService.MAX_CACHE_TRYS) {
            console.log('Retry caching...');
            this.clearCache();
            this._currentCacheTrys++;
          } else {
            const msg = 'Maximum number of caching calls exceeded, terminate!';
            console.log(msg);
            this._currentCacheTrys = 0;
            reject(msg);
          }
        });
    });
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

  public initChart(chartType: ChartType, chartId: string): Observable<FractalisChart> {
    const chartObject = this.F.setChart(chartType, chartId);
    const chartSubject = new BehaviorSubject<FractalisChart>({
      type: chartType,
      chartObject: chartObject,
      description: null
    });
    this.F.getChartParameterDescriptions(chartObject, (description: FractalisChartDescription) => {
      chartSubject.next({
        type: chartType,
        chartObject: chartObject,
        description: description
      })
    }, error => chartSubject.error(error));
    return chartSubject.asObservable();
  }

  public setChartParameters(chartObject: any, parameters: object) {
    this.F.setChartParameters(chartObject, parameters);
  }

  private retrieveFractalisChartTypes() {
    if (this.isFractalisEnabled) {
      const types: string[] = this.F.getAvailableCharts();
      types.forEach((t: string) => {
        const type = <ChartType>t.toLowerCase();
        this.availableChartTypes.push({
          label: type,
          value: type
        });
      });
    }
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

  public invalidateVariables(errorMessages: string[]) {
    this.variablesValidationMessages = errorMessages;
    this.variablesInvalid = true;
  }

  public clearValidation() {
    this.variablesValidationMessages = [];
    this.variablesInvalid = false;
  }

  get isInitialized(): boolean {
    return this.F ? true : false;
  }

  get isFractalisEnabled(): boolean {
    return this.appConfig.getConfig('enable-fractalis-analysis') && fjs.fractalis;
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

  get isPreparingCache(): boolean {
    return this._isPreparingCache;
  }

  set isPreparingCache(value: boolean) {
    this._isPreparingCache = value;
  }

  get isClearingCache(): boolean {
    return this._isClearingCache;
  }

  set isClearingCache(value: boolean) {
    this._isClearingCache = value;
  }

  get selectedVariables(): Concept[] {
    return this._selectedVariables;
  }

  set selectedVariables(value: Concept[]) {
    this._selectedVariables = value;
  }

  get variablesValidationMessages(): string[] {
    return this._variablesValidationMessages;
  }

  set variablesValidationMessages(value: string[]) {
    this._variablesValidationMessages = value;
  }

  get variablesInvalid(): boolean {
    return this._variablesInvalid;
  }

  set variablesInvalid(value: boolean) {
    this._variablesInvalid = value;
  }

  get chartDivSize(): number {
    return this._chartDivSize;
  }

  set chartDivSize(value: number) {
    this._chartDivSize = value;
  }

  get variablesStatus(): FractalisVariablesStatus {
    return this._variablesStatus;
  }

  get selectedVariablesUpdated(): Subject<Concept[]> {
    return this._selectedVariablesUpdated;
  }
}
