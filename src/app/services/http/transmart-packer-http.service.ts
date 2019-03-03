/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Observable, of as observableOf} from 'rxjs';
import {Injectable} from '@angular/core';
import {Constraint} from '../../models/constraint-models/constraint';
import {ExportJob} from '../../models/export-models/export-job';
import {AppConfig} from '../../config/app.config';
import {TransmartConstraintMapper} from '../../utilities/transmart-utilities/transmart-constraint-mapper';
import {ExportDataType} from '../../models/export-models/export-data-type';
import {ExportFileFormat} from '../../models/export-models/export-file-format';
import {TransmartPackerJob} from '../../models/transmart-models/transmart-packer-job';
import {HttpHelper} from '../../utilities/http-helper';
import {HttpClient} from '@angular/common/http';
import {TransmartExportJob} from '../../models/transmart-models/transmart-export-job';


@Injectable({
  providedIn: 'root',
})
export class TransmartPackerHttpService {

  private _customExportJobName: string;
  private _endpointUrl: string;
  private httpHelper: HttpHelper;

  constructor(private appConfig: AppConfig, private httpClient: HttpClient) {
    this.customExportJobName = this.appConfig.getConfig('export-mode')['data-view'];
    this.endpointUrl = this.appConfig.getConfig('export-mode')['export-url'];
    this.httpHelper = new HttpHelper(this.endpointUrl, httpClient);
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


  // ------------------------------------- export job calls -------------------------------------

  /**
   * Get the current user's existing export jobs
   * @returns {Observable<any[]>}
   */
  getAllJobs(): Observable<TransmartPackerJob[]> {
    const urlPart = 'jobs';
    const responseField = 'jobs';
    return this.httpHelper.getCall(urlPart, responseField);
  }

  /**
   * Get a status of the job
   * @param jobId
   * @returns {Observable<ExportJob>}
   */
  getJobStatus(jobId: string): Observable<TransmartPackerJob> {
    const urlPart = `jobs/status/${jobId}`;
    const responseField = 'exportJob';
    return this.httpHelper.getCall(urlPart, responseField);
  }

  /**
   * Create and run an export job for the current user, with a given name
   *
   * @param {string} jobName
   * @param {Constraint} targetConstraint
   * @returns {Observable<ExportJob>}
   */
  runJob(jobName: string, targetConstraint: Constraint): Observable<TransmartPackerJob> {
    const urlPart = `jobs/create`;
    const responseField = 'job';
    const constraint = TransmartConstraintMapper.mapConstraintOnPatientLevel(targetConstraint);

    let body = {
      job_type: this.customExportJobName,
      job_parameters: {
        constraint: constraint,
        custom_name: jobName,
      }
    };
    if (targetConstraint.dimension !== 'patient') {
      body.job_parameters['row_filter'] = TransmartConstraintMapper.mapConstraint(targetConstraint);
    }

    return this.httpHelper.postCall(urlPart, body, responseField);
  }

  /**
   * Given an export job id, return the blob (zipped file) ready to be used on frontend
   * @param jobId
   * @returns {Observable<blob>}
   */
  downloadJobData(jobId: string): Observable<Blob> {
    let url = `jobs/data/${jobId}`;
    return this.httpHelper.downloadData(url);
  }

  /**
   * Cancels an export job with the given export job id
   * @param jobId
   * @returns {Observable<blob>}
   */
  cancelJob(jobId: string): Observable<{}> {
    const urlPart = `jobs/cancel/${jobId}`;
    return this.httpHelper.getCall(urlPart, null);
  }


  // -------------------------------------- other export functions --------------------------------------

  /**
   * Creates export job,
   * when the external job handler has one method to both create and run the job
   * @param {string} name
   * @returns {Observable<TransmartExportJob>}
   */
  createExportJob(name: string): Observable<TransmartExportJob> {
    let newExportJob = new TransmartExportJob();
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
