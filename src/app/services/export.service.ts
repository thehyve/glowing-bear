/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Injectable, Injector} from '@angular/core';
import {ExportDataType} from '../models/export-models/export-data-type';
import {ConstraintService} from './constraint.service';
import {ResourceService} from './resource.service';
import {ExportJob} from '../models/export-models/export-job';
import {DataTableService} from './data-table.service';
import {saveAs} from 'file-saver';
import {MessageHelper} from '../utilities/message-helper';
import {ErrorHelper} from '../utilities/error-helper';
import {HttpErrorResponse} from '@angular/common/http';
import {AccessLevel} from './authentication/access-level';
import {AuthenticationService} from './authentication/authentication.service';
import {StudyService} from './study.service';
import {AsyncSubject} from 'rxjs';
import {AppConfig} from '../config/app.config';
import {CountService} from './count.service';
import {VariableService} from './variable.service';

@Injectable({
  providedIn: 'root',
})
export class ExportService {

  private _exportEnabled: AsyncSubject<boolean> = new AsyncSubject<boolean>();
  private _exportDataTypes: ExportDataType[] = [];
  private _exportJobs: ExportJob[] = [];
  private _exportJobName = '';
  private _isTransmartDateColumnsIncluded = false;
  private _isDataTypesUpdating = false;

  constructor(private appConfig: AppConfig,
              private constraintService: ConstraintService,
              private resourceService: ResourceService,
              private authService: AuthenticationService,
              private studyService: StudyService,
              private dataTableService: DataTableService,
              private variableService: VariableService,
              private injector: Injector) {
    this.authService.accessLevel.asObservable()
      .subscribe((level: AccessLevel) => {
        if (level === AccessLevel.Full) {
          this.exportEnabled.next(true);
          this.exportEnabled.complete();
        } else {
          this.studyService.existsPublicStudy
            .subscribe((existsPublicStudy) => {
              this.exportEnabled.next(existsPublicStudy);
              this.exportEnabled.complete();
            });
        }
      });

    /**
     * If the export-mode's name is 'transmart' and data-view is 'dataTable',
     *        is data table used for export job creation, which means
     *        updating data table first, then exprot data types, i.e.
     *        dataTableService.dataTableUpdated -> updateExportDataTypes()
     * Else, there is no need to wait for data table to complete,
     *        directly update export data types whenever the variables are updated, i.e.
     *        constraintService.variablesUpdated -> updateExportDataTypes()
     */
    if (this.isTransmartDataTable) {
      this.dataTableService.dataTableUpdated.asObservable()
        .subscribe(() => {
          this.updateExportDataTypes();
        });
    } else {
      this.variableService.variablesUpdated.asObservable()
        .subscribe(() => {
          this.updateExportDataTypes();
        });
    }
  }

  private updateExportDataTypes() {
    console.log('update export data types');
    // update the export info
    this.isDataTypesUpdating = true;
    this.resourceService.getExportDataTypes(this.variableService.combination)
      .subscribe(dataTypes => {
          this.exportDataTypes = dataTypes;
          this.isDataTypesUpdating = false;
        },
        (err: HttpErrorResponse) => {
          ErrorHelper.handleError(err);
          this.exportDataTypes = [];
          this.isDataTypesUpdating = false;
        }
      );
  }

  /**
   * Prepare and create the export job when the user clicks the 'Create export' button
   */
  public prepareExportJob(): Promise<any> {
    return new Promise((resolve, reject) => {
      let name = this.exportJobName === null ? '' : this.exportJobName.trim();
      if (!this.isDataAvailable) {
        return reject(`No data is available for exporting`);
      }
      let summary = 'Running export job "' + name + '".';
      MessageHelper.alert('info', summary);

      if (this.isTransmartDataTable && this.dataTableService.isDirty) {
        this.dataTableService.updateDataTable().then(() => {
          this.createExportJob(name)
            .then(() => {
              resolve(true);
            })
            .catch(err => {
              reject(err);
            });
        }).catch(err => {
          summary = 'Fail to fetch a data table required for the export job "' + name + '".';
          MessageHelper.alert('error', summary);
          reject(err);
        });
      } else {
        return this.createExportJob(name);
      }
    });
  }

  private createExportJob(name): Promise<any> {
    return new Promise((resolve, reject) => {
      this.resourceService.createExportJob(name)
        .subscribe(
          (newJob: ExportJob) => {
            let summary = 'Export job "' + name + '" is created.';
            MessageHelper.alert('success', summary);
            this.exportJobName = '';
            this.runExportJob(newJob)
              .then(() => {
                resolve(true);
              })
              .catch(err => {
                reject(err);
            });
          },
          (err: HttpErrorResponse) => {
            ErrorHelper.handleError(err);
            reject(`Fail to create export job ${name}.`);
          }
        );
    });
  }

  /**
   * Run the just created export job
   * @param job
   */
  public runExportJob(job: ExportJob): Promise<any> {
    return new Promise((resolve, reject) => {
      this.resourceService.runExportJob(
        job,
        this.exportDataTypes,
        this.variableService.combination,
        this.dataTableService.dataTable,
        this.isTransmartDateColumnsIncluded
      )
        .subscribe(
          returnedExportJob => {
            if (returnedExportJob) {
              this.updateExportJobs()
                .then(() => {
                  resolve(true);
                })
                .catch(err => {
                  reject(err);
                });
            } else {
              reject(`Fail to run export job ${job.name}, server returns undefined job.`);
            }
          },
          (err: HttpErrorResponse) => {
            ErrorHelper.handleError(err);
            reject(`Fail to run export job ${job.name}.`);
          }
        );
    });
  }

  /**
   * When an export job's status is 'completed', the user can click the Download button,
   * then the files of that job can be downloaded
   * @param job
   */
  downloadExportJob(job: ExportJob) {
    job.disabled = true;
    this.resourceService.downloadExportJob(job.id)
      .subscribe(
        (data) => {
          const blob = new Blob([data], {type: 'application/zip'});
          const filename = job.name + ' ' + job.time.toISOString();
          saveAs(blob, `${filename}.zip`, true);
        },
        (err: HttpErrorResponse) => {
          ErrorHelper.handleError(err);
        },
        () => {
          MessageHelper.alert('success', `Export ${job.name} download completed`);
          job.disabled = false;
        }
      );
  }

  cancelExportJob(job: ExportJob): Promise<any> {
    return new Promise((resolve, reject) => {
      job.disabled = true;
      this.resourceService.cancelExportJob(job.id)
        .subscribe(
          () => {
            this.updateExportJobs().then(() => {
              resolve(true);
            }).catch(err => {
              reject(err);
            })
          },
          (err: HttpErrorResponse) => {
            ErrorHelper.handleError(err);
            reject(err);
          }
        );
    });
  }

  archiveExportJob(job: ExportJob): Promise<any> {
    return new Promise((resolve, reject) => {
      job.disabled = true;
      this.resourceService.archiveExportJob(job.id)
        .subscribe(
          () => {
            this.updateExportJobs().then(() => {
              resolve(true);
            }).catch(err => {
              reject(err);
            })
          },
          (err: HttpErrorResponse) => {
            ErrorHelper.handleError(err);
            reject(err);
          }
        );
    });
  }

  updateExportJobs(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.resourceService.getExportJobs()
        .subscribe(
          (jobs: ExportJob[]) => {
            jobs.forEach(job => {
              job.disabled = false
            });
            this.exportJobs = jobs;
            resolve(true);
          },
          (err: HttpErrorResponse) => {
            ErrorHelper.handleError(err);
            reject('Fail to update export jobs.');
          }
        );
    });
  }

  updateDataTableExportFormats() {
    if (this.dataTableService.isDirty) {
      this.dataTableService.updateDataTable();
    }
  }

  /**
   * Checks if data is available for export.
   * @returns {boolean}
   */
  get isDataAvailable(): boolean {
    // Validate if at least one subject is included and variable nodes are selected
    let countService = this.injector.get(CountService);
    return countService.currentSelectionCount.subjectCount > 0 &&
      (this.variableService.selectedVariablesTree.length > 0 ||
        this.variableService.variables.filter(v => v.selected === true).length > 0);
  }

  get isExternalExportAvailable(): boolean {
    return this.appConfig.getConfig('export-mode')['name'] !== 'transmart';
  }

  get isTransmartSurveyTable(): boolean {
    let exportMode = this.appConfig.getConfig('export-mode');
    return exportMode['name'] === 'transmart' && exportMode['data-view'] === 'surveyTable';
  }

  get isTransmartDataTable(): boolean {
    let exportMode = this.appConfig.getConfig('export-mode');
    return exportMode['name'] === 'transmart' && exportMode['data-view'] === 'dataTable';
  }

  get isTransmartDateColumnsIncluded(): boolean {
    return this._isTransmartDateColumnsIncluded;
  }

  set isTransmartDateColumnsIncluded(value: boolean) {
    this._isTransmartDateColumnsIncluded = value;
  }

  get exportDataTypes(): ExportDataType[] {
    return this._exportDataTypes;
  }

  set exportDataTypes(value: ExportDataType[]) {
    this._exportDataTypes = value;
  }

  get isDataTypesUpdating(): boolean {
    return this._isDataTypesUpdating;
  }

  set isDataTypesUpdating(value: boolean) {
    this._isDataTypesUpdating = value;
  }

  get exportJobs(): ExportJob[] {
    return this._exportJobs;
  }

  set exportJobs(value: ExportJob[]) {
    this._exportJobs = value;
  }

  get exportJobName(): string {
    return this._exportJobName;
  }

  set exportJobName(value: string) {
    this._exportJobName = value;
  }

  get isDataTableUpdating(): boolean {
    return this.dataTableService.isUpdating;
  }

  get includeDataTable(): boolean {
    return this.dataTableService.includeDataTable;
  }

  get exportEnabled(): AsyncSubject<boolean> {
    return this._exportEnabled;
  }

  set exportEnabled(value: AsyncSubject<boolean>) {
    this._exportEnabled = value;
  }
}
