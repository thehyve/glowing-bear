/**
 * Copyright 2017 - 2018  The Hyve B.V.
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
import {Observable, AsyncSubject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExportService {

  private _exportEnabled: AsyncSubject<boolean> = new AsyncSubject<boolean>();
  private _exportDataTypes: ExportDataType[] = [];
  private _exportJobs: ExportJob[] = [];
  private _exportJobName: string;
  private _isTransmartDateColumnsIncluded = false;
  private _isDataTypesUpdating = false;

  constructor(private constraintService: ConstraintService,
              private resourceService: ResourceService,
              private authService: AuthenticationService,
              private studyService: StudyService,
              private dataTableService: DataTableService,
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
    this.dataTableService.dataTableUpdated.asObservable()
      .subscribe(() => {
        this.updateExportDataTypes();
      });
  }

  private updateExportDataTypes() {
    let combo = this.constraintService.constraint_1_2();
    // update the export info
    this.isDataTypesUpdating = true;
    this.resourceService.getExportDataTypes(combo)
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
   * Create the export job when the user clicks the 'Export selected sets' button
   */
  public createExportJob(): Promise<any> {
    return new Promise((resolve, reject) => {
      let name = this.exportJobName.trim();

      if (this.validateExportJob(name)) {
        let summary = 'Running export job "' + name + '".';
        MessageHelper.alert('info', summary);
        this.resourceService.createExportJob(name)
          .subscribe(
            (newJob: ExportJob) => {
              summary = 'Export job "' + name + '" is created.';
              MessageHelper.alert('success', summary);
              this.exportJobName = '';
              this.runExportJob(newJob)
                .then(() => {
                  resolve(true);
                })
                .catch(err => {
                  reject(err)
                });
            },
            (err: HttpErrorResponse) => {
              ErrorHelper.handleError(err);
              reject(`Fail to create export job ${name}.`);
            }
          );
      } else {
        reject(`Invalid export job ${name}`);
      }
    });
  }

  /**
   * Run the just created export job
   * @param job
   */
  public runExportJob(job: ExportJob): Promise<any> {
    return new Promise((resolve, reject) => {
      let constraint = this.constraintService.constraint_1_2();
      this.resourceService
        .runExportJob(job,
          this.exportDataTypes,
          constraint,
          this.dataTableService.dataTable,
          this.isTransmartDateColumnsIncluded)
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
              reject(`Fail to run export job ${job.jobName}, server returns undefined job.`);
            }
          },
          (err: HttpErrorResponse) => {
            ErrorHelper.handleError(err);
            reject(`Fail to run export job ${job.jobName}.`);
          }
        );
    });
  }

  /**
   * When an export job's status is 'completed', the user can click the Download button,
   * then the files of that job can be downloaded
   * @param job
   */
  public downloadExportJob(job: ExportJob) {
    job.isInDisabledState = true;
    this.resourceService.downloadExportJob(job.id)
      .subscribe(
        (data) => {
          const blob = new Blob([data], {type: 'application/zip'});
          const filename = job.jobName + ' ' + job.jobStatusTime;
          saveAs(blob, `${filename}.zip`, true);
        },
        (err: HttpErrorResponse) => {
          ErrorHelper.handleError(err);
        },
        () => {
          MessageHelper.alert('success', `Export ${job.jobName} download completed`);
        }
      );
  }

  public cancelExportJob(job) {
    job.isInDisabledState = true;
    this.resourceService.cancelExportJob(job.id)
      .subscribe(
        response => {
          this.updateExportJobs();
        },
        (err: HttpErrorResponse) => {
          ErrorHelper.handleError(err);
        }
      );
  }

  public archiveExportJob(job) {
    job.isInDisabledState = true;
    this.resourceService.archiveExportJob(job.id)
      .subscribe(
        response => {
          this.updateExportJobs();
        },
        (err: HttpErrorResponse) => {
          ErrorHelper.handleError(err);
        }
      );
  }

  public updateExportJobs(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.resourceService.getExportJobs()
        .subscribe(
          jobs => {
            jobs.forEach(job => {
              job.isInDisabledState = false
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

  /**
   * Validate a new exportJob
   * @param {string} name
   * @returns {boolean}
   */
  public validateExportJob(name: string): boolean {
    let validName = name !== '';
    // 1. Validate if job name is specified
    if (!validName) {
      const summary = 'Please specify the job name.';
      MessageHelper.alert('warn', summary);
      return false;
    }
    // 2. Validate if job name is not duplicated
    for (let job of this.exportJobs) {
      if (job['jobName'] === name) {
        const summary = 'Duplicate job name, choose a new name.';
        MessageHelper.alert('warn', summary);
        return false;
      }
    }
    // 3. Validate if at least one data type is selected
    if (!this.exportDataTypes.some(ef => ef['checked'] === true)) {
      const summary = 'Please select at least one data type.';
      MessageHelper.alert('warn', summary);
      return false;
    }
    // 4. Validate if at least one file format is selected for checked data formats
    for (let dataFormat of this.exportDataTypes) {
      if (dataFormat['checked'] === true) {
        if (!dataFormat['fileFormats'].some(ff => ff['checked'] === true)) {
          const summary = 'Please select at least one file format for ' + dataFormat['name'] + ' data format.';
          MessageHelper.alert('warn', summary);
          return false;
        }
      }
    }
    // 5. Validate if at least one observation is included
    // TODO: update counts when a subset of variables is selected
    // let cohortService = this.injector.get(CohortService);
    // if (cohortService.counts_2.observationCount < 1) {
    //   const summary = 'No observation included to be exported.';
    //   MessageHelper.alert('warn', summary);
    //   return false;
    // }

    return true;
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

<<<<<<< HEAD
  get isTransmartDateColumnsIncluded(): boolean {
    return this._isTransmartDateColumnsIncluded;
  }

  set isTransmartDateColumnsIncluded(value: boolean) {
    this._isTransmartDateColumnsIncluded = value;
=======
  get isDataTableUpdating(): boolean {
    return this.dataTableService.isUpdating;
  }

  get exportEnabled(): AsyncSubject<boolean> {
    return this._exportEnabled;
  }

  set exportEnabled(value: AsyncSubject<boolean>) {
    this._exportEnabled = value;
>>>>>>> redefine export workflow
  }
}
