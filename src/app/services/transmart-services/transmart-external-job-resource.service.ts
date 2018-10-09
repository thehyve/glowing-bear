/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Observable, of as observableOf} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Constraint} from '../../models/constraint-models/constraint';
import {ExportJob} from '../../models/export-models/export-job';
import {AppConfig} from '../../config/app.config';
import {TransmartConstraintMapper} from '../../utilities/transmart-utilities/transmart-constraint-mapper';
import {ErrorHelper} from '../../utilities/error-helper';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {ConstraintMark} from '../../models/constraint-models/constraint-mark';
import {catchError, map} from 'rxjs/operators';
import {ExportDataType} from '../../models/export-models/export-data-type';
import {ExportFileFormat} from '../../models/export-models/export-file-format';
import {TransmartExternalJob} from '../../models/transmart-models/transmart-external-job';


@Injectable()
export class TransmartExternalJobResourceService {

  private _customExportJobName: string;
  private _endpointUrl: string;

  /*
   * Flag indicating if the subject selection
    savePatientSet(arg0: any, arg1: any): any {
        throw new Error("Method not implemented.");
    } of step 1 should be automatically
   * saved as subject set in the backend. If true, that subject set is used as the subject constraint
   * for step 2.
   */
  private _autosaveSubjectSets: boolean;
  private _subjectSetConstraint: SubjectSetConstraint;

  constructor(private appConfig: AppConfig,
              private http: HttpClient) {
    this.customExportJobName = appConfig.getConfig('custom-export-job-name');
    this.endpointUrl = appConfig.getConfig('export-service-url');
    this.subjectSetConstraint = new SubjectSetConstraint();
  }

  get subjectSetConstraint(): SubjectSetConstraint {
    return this._subjectSetConstraint;
  }

  set subjectSetConstraint(value: SubjectSetConstraint) {
    this._subjectSetConstraint = value;
  }

  get customExportJobName(): string {
    return this._customExportJobName;
  }

  set customExportJobName(value: string) {
    this._customExportJobName = value;
  }

  get endpointUrl(): string {
    return this._endpointUrl;
  }

  set endpointUrl(value: string) {
    this._endpointUrl = value;
  }

  get autosaveSubjectSets(): boolean {
    return this._autosaveSubjectSets;
  }

  set autosaveSubjectSets(value: boolean) {
    this._autosaveSubjectSets = value;
  }

  // ------------------------------------- export job calls -------------------------------------

  /**
   * Make a post http request
   * @param urlPart - the part used in baseUrl/urlPart
   * @param body
   * @param responseField
   * @returns {Observable<any | any>}
   */
  private postCall(urlPart, body, responseField) {
    const url = `${this.endpointUrl}/${urlPart}`;
    if (responseField) {
      return this.http.post(url, body).pipe(
        map(res => res[responseField]),
        catchError(error => {
          ErrorHelper.handleError(error);
          return observableOf(error);
        })
      );
    } else {
      return this.http.post(url, body).pipe(
        catchError(error => {
          ErrorHelper.handleError(error);
          return observableOf(error);
        })
      );
    }
  }

  /**
   * Make a get http request
   * @param urlPart - the part used in baseUrl/urlPart
   * @param responseField
   * @returns {Observable<any | any>}
   */
  private getCall(urlPart, responseField) {
    const url = `${this.endpointUrl}/${urlPart}`;
    if (responseField) {
      return this.http.get(url).pipe(
        map((res) => res[responseField]),
        catchError((error: HttpErrorResponse) => {
          ErrorHelper.handleError(error);
          return observableOf(error);
        })
      );
    } else {
      return this.http.get(url).pipe(
        catchError((error: HttpErrorResponse) => {
          ErrorHelper.handleError(error);
          return observableOf(error);
        })
      );
    }
  }

  /**
   * Get the current user's existing export jobs
   * @returns {Observable<any[]>}
   */
  getAllJobs(): Observable<TransmartExternalJob[]> {
    const urlPart = 'jobs';
    const responseField = 'jobs';
    return this.getCall(urlPart, responseField);
  }

  /**
   * Get a status of the job
   * @param jobId
   * @returns {Observable<ExportJob>}
   */
  getJobStatus(jobId: string): Observable<TransmartExternalJob> {
    const urlPart = `jobs/status/${jobId}`;
    const responseField = 'exportJob';
    return this.getCall(urlPart, responseField);
  }

  /**
   * Create and run an export job for the current user, with a given name
   *
   * @param {string} jobName
   * @param {Constraint} constraint
   * @returns {Observable<ExportJob>}
   */
  runJob(jobName: string, constraint: Constraint): Observable<TransmartExternalJob> {
    const urlPart = `jobs/create`;
    const responseField = 'job';
    let targetConstraint = constraint;
    if (this.autosaveSubjectSets &&
      constraint.className === 'CombinationConstraint' &&
      (<CombinationConstraint>constraint).children[1].mark === ConstraintMark.OBSERVATION) {
      let combo = new CombinationConstraint();
      combo.addChild(this.subjectSetConstraint);
      combo.addChild((<CombinationConstraint>constraint).children[1]);
      targetConstraint = combo;
    }

    let body = {
      job_type: this.customExportJobName,
      job_parameters: {
        constraint: TransmartConstraintMapper.mapConstraint(targetConstraint),
        custom_name: jobName
      }
    };

    return this.postCall(urlPart, body, responseField);
  }

  /**
   * Given an export job id, return the blob (zipped file) ready to be used on frontend
   * @param jobId
   * @returns {Observable<blob>}
   */
  downloadJobData(jobId: string) {
    let url = `${this.endpointUrl}/jobs/data/${jobId}`;
    return this.http.get(url, {responseType: 'blob'}).pipe(
      catchError(ErrorHelper.handleError.bind(this)));
  }

  /**
   * Cancels an export job with the given export job id
   * @param jobId
   * @returns {Observable<blob>}
   */
  cancelJob(jobId: string): Observable<{}> {
    const urlPart = `jobs/cancel/${jobId}`;
    return this.getCall(urlPart, null);
  }


  // -------------------------------------- other export functions --------------------------------------

  /**
   * Creates export job,
   * when the external job handler has one method to both create and run the job
   * @param {string} name
   * @returns {Observable<ExportJob>}
   */
  createExportJob(name: string): Observable<ExportJob> {
    let newExportJob = new ExportJob();
    newExportJob.id = name;
    newExportJob.jobName = name;
    return observableOf(newExportJob);
  }

  /**
   * Returns file formats that are supported by the external tool,
   * only TSV export of clinical data is currently supported
   * @returns {Observable<ExportJob>}
   */
  getExportDataTypes(): Observable<ExportDataType[]> {
    let dataTypes = [];
    let dataType = new ExportDataType('clinical', true);
    dataType.fileFormats.push(new ExportFileFormat('TSV', true));
    dataTypes.push(dataType);
    return observableOf(dataTypes);
  }
  /**
   * Removes the job
   * Currently not supported by the external tool
   * @param {string} jobID
   * @returns {Observable<{}>}
   */
  archiveJob(jobID: string): Observable<{}> {
    return observableOf({})
  }
}
