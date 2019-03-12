/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AsyncSubject, Observable, of as observableOf} from 'rxjs';
import {Injectable} from '@angular/core';
import {Constraint} from '../../models/constraint-models/constraint';
import {Pedigree} from '../../models/constraint-models/pedigree';
import {SubjectSet} from '../../models/constraint-models/subject-set';
import {TransmartTableState} from '../../models/transmart-models/transmart-table-state';
import {TransmartDataTable} from '../../models/transmart-models/transmart-data-table';
import {TransmartStudyDimensionElement} from 'app/models/transmart-models/transmart-study-dimension-element';
import {AppConfig} from '../../config/app.config';
import {TransmartExportElement} from '../../models/transmart-models/transmart-export-element';
import {TransmartCrossTable} from '../../models/transmart-models/transmart-cross-table';
import {TransmartConstraintMapper} from '../../utilities/transmart-utilities/transmart-constraint-mapper';
import {ErrorHelper} from '../../utilities/error-helper';
import {TransmartCountItem} from '../../models/transmart-models/transmart-count-item';
import {TransmartStudy} from '../../models/transmart-models/transmart-study';
import {map} from 'rxjs/operators';
import {TransmartTrialVisit} from '../../models/transmart-models/transmart-trial-visit';
import {HttpHelper} from '../../utilities/http-helper';
import {HttpClient} from '@angular/common/http';
import {TransmartExportJob} from '../../models/transmart-models/transmart-export-job';
import {TransmartPatient} from '../../models/transmart-models/transmart-patient';
import {TransmartDimension} from '../../models/transmart-models/transmart-dimension';


@Injectable({
  providedIn: 'root',
})
export class TransmartHttpService {

  static sortableDimensions = new Set<string>([
    'patient', 'concept', 'start time', 'end time', 'visit', 'location', 'provider', 'study', 'trial visit'
  ]);
  private httpHelper: HttpHelper;

  private _endpointUrl: string;
  private _studiesLock: boolean;
  private _studies: TransmartStudy[] = null;
  private _studiesSubject: AsyncSubject<TransmartStudy[]>;


  constructor(private appConfig: AppConfig, httpClient: HttpClient) {
    this.endpointUrl = `${this.appConfig.getConfig('api-url')}/${this.appConfig.getConfig('api-version')}`;
    this.httpHelper = new HttpHelper(this.endpointUrl, httpClient);
  }

  get endpointUrl(): string {
    return this._endpointUrl;
  }

  set endpointUrl(value: string) {
    this._endpointUrl = value;
  }


  // -------------------------------------- tree node calls --------------------------------------
  /**
   * Returns the available studies.
   * @returns {Observable<Study[]>}
   */
  getStudies(): Observable<TransmartStudy[]> {
    const urlPart = 'studies';
    const responseField = 'studies';
    return this.httpHelper.getCall(urlPart, responseField);
  }

  /**
   * Returns the list of all studies (and related dimensions) that
   * the user has access to.
   *
   * Fetch the studies once and caches them. Subsequent calls will
   * get the list of studies from the cache.
   *
   * @return {Promise<Study[]>}
   */
  get studies(): Promise<TransmartStudy[]> {
    if (this._studies != null) {
      return observableOf(this._studies).toPromise();
    }
    if (this._studiesLock) {
      return this._studiesSubject.toPromise();
    }
    this._studiesLock = true;
    this._studiesSubject = new AsyncSubject<TransmartStudy[]>();

    return new Promise((resolve, reject) => {
      this.getStudies()
        .subscribe((studies: TransmartStudy[]) => {
          resolve(studies);
          this._studies = studies;
          this._studiesSubject.next(this._studies);
          this._studiesSubject.complete();
          this._studiesLock = false;
        }, (error: any) => {
          console.error(`Error retrieving studies: ${error}`);
          reject(error);
          this._studies = [];
          this._studiesSubject.next(this._studies);
          this._studiesSubject.complete();
          this._studiesLock = false;
        });
    });
  }

  /**
   * Get a specific branch of the tree nodes
   * @param {string} root - the path to the specific tree node
   * @param {number} depth - the depth of the tree we want to access
   * @param {boolean} hasCounts - whether we want to include patient and observation counts in the tree nodes
   * @param {boolean} hasTags - whether we want to include metadata in the tree nodes
   * @returns {Observable<Object>}
   */
  getTreeNodes(root: string, depth: number, hasCounts: boolean, hasTags: boolean): Observable<object> {
    let urlPart = `tree_nodes?root=${root}&depth=${depth}`;
    if (hasCounts) {
      urlPart += '&counts=true';
    }
    if (hasTags) {
      urlPart += '&tags=true';
    }
    const responseField = 'tree_nodes';
    return this.httpHelper.getCall(urlPart, responseField);
  }

  // -------------------------------------- count calls --------------------------------------

  /**
   * Given a constraint, get the patient counts and observation counts
   * organized per study, then per concept.
   * Side benefit:
   * - can calculate total number of obervations under the given constraint
   * - if in autosaveSubjectSets mode, can retrieve the total number of subjects under the given constraint
   * @param {Constraint} constraint
   * @returns {Observable<Object>}
   */
  getCountsPerStudyAndConcept(constraint: Constraint): Observable<object> {
    const urlPart = 'observations/counts_per_study_and_concept';
    const body = {constraint: TransmartConstraintMapper.mapConstraint(constraint)};
    const responseField = 'countsPerStudy';
    return this.httpHelper.postCall(urlPart, body, responseField);
  }

  /**
   * Give a constraint, get the patient counts and observation counts
   * organized per study
   * @param {Constraint} constraint
   * @returns {Observable<Object>}
   */
  getCountsPerStudy(constraint: Constraint): Observable<object> {
    const urlPart = 'observations/counts_per_study';
    const body = {constraint: TransmartConstraintMapper.mapConstraint(constraint)};
    const responseField = 'countsPerStudy';
    return this.httpHelper.postCall(urlPart, body, responseField);
  }

  /**
   * Give a constraint, get the patient and observation counts per concept
   * @param {Constraint} constraint
   * @returns {Observable<any>}
   */
  getCountsPerConcept(constraint: Constraint): Observable<object> {
    const urlPart = 'observations/counts_per_concept';
    const body = {constraint: TransmartConstraintMapper.mapConstraint(constraint)};
    const responseField = 'countsPerConcept';
    return this.httpHelper.postCall(urlPart, body, responseField);
  }

  /**
   * Give a constraint, get the corresponding patient count and observation count.
   * @param {Constraint} constraint
   * @returns {Observable<Object>}
   */
  getCounts(constraint: Constraint): Observable<TransmartCountItem> {
    const urlPart = 'observations/counts';
    const body = {constraint: TransmartConstraintMapper.mapConstraint(constraint)};
    const responseField = false;
    return this.httpHelper.postCall(urlPart, body, responseField);
  }

  // -------------------------------------- aggregate calls --------------------------------------
  /**
   * Get the aggregate based on the given constraint and aggregate options,
   * the options can be {min, max, count, values, average}
   * @param {Constraint} constraint
   * @returns {Observable<object>}
   */
  getAggregate(constraint: Constraint): Observable<object> {
    const urlPart = 'observations/aggregates_per_concept';
    const body = {constraint: TransmartConstraintMapper.mapConstraint(constraint)};
    const responseField = 'aggregatesPerConcept';
    return this.httpHelper.postCall(urlPart, body, responseField);
  }

  getCategoricalAggregate(constraint: Constraint): Observable<object> {
    const urlPart = 'observations/aggregates_per_categorical_concept';
    const body = {constraint: TransmartConstraintMapper.mapConstraint(constraint)};
    const responseField = 'aggregatesPerCategoricalConcept';
    return this.httpHelper.postCall(urlPart, body, responseField);
  }

  // -------------------------------------- trial visit calls --------------------------------------
  /**
   * Given a constraint, normally a concept or a study constraint, return the corresponding trial visit list
   * @param constraint
   * @returns {Observable<R|T>}
   */
  getTrialVisits(constraint: Constraint): Observable<TransmartTrialVisit[]> {
    const urlPart = `dimensions/trial visit/elements`;
    const body = {constraint: TransmartConstraintMapper.mapConstraint(constraint)};
    const responseField = 'elements';
    return this.httpHelper.postCall(urlPart, body, responseField);
  }

  // -------------------------------------- pedigree calls --------------------------------------
  /**
   * Get the available pedigree relation types such as parent, child, spouse, sibling and various twin types
   * @returns {Observable<Pedigree[]>}
   */
  getPedigrees(): Observable<Pedigree[]> {
    const urlPart = 'pedigree/relation_types';
    const responseField = 'relationTypes';
    return this.httpHelper.getCall(urlPart, responseField);
  }

  // -------------------------------------- patient calls --------------------------------------
  /**
   * Get the patient list whose observations correspond to the given constraint
   * @param constraint
   * @returns {Observable<TransmartPatient[]>}
   */
  getPatients(constraint: Constraint): Observable<TransmartPatient[]> {
    const urlPart = 'patients';
    const body = {constraint: TransmartConstraintMapper.mapConstraint(constraint)};
    const responseField = 'patients';
    return this.httpHelper.postCall(urlPart, body, responseField);
  }


  // -------------------------------------- export calls --------------------------------------
  /**
   * Given a list of patient set ids as strings, get the corresponding data formats available for download
   * @param constraint
   * @returns {Observable<string[]>}
   */
  getExportDataFormats(constraint: Constraint): Observable<string[]> {
    const urlPart = 'export/data_formats';
    const body = {constraint: TransmartConstraintMapper.mapConstraint(constraint)};
    const responseField = 'dataFormats';
    return this.httpHelper.postCall(urlPart, body, responseField);
  }

  getExportFileFormats(dataView: string): Observable<string[]> {
    const urlPart = `export/file_formats?dataView=${dataView}`;
    const responseField = 'fileFormats';
    return this.httpHelper.getCall(urlPart, responseField);
  }

  /**
   * Get the current user's existing export jobs
   * @returns {Observable<TransmartExportJob[]>}
   */
  getExportJobs(): Observable<TransmartExportJob[]> {
    const urlPart = 'export/jobs';
    const responseField = 'exportJobs';
    return this.httpHelper.getCall(urlPart, responseField);
  }

  /**
   * Create a new export job for the current user, with a given name
   * @param name
   * @returns {Observable<TransmartExportJob>}
   */
  createExportJob(name: string): Observable<TransmartExportJob> {
    const urlPart = `export/job?name=${encodeURIComponent(name)}`;
    const responseField = 'exportJob';
    return this.httpHelper.postCall(urlPart, {}, responseField);
  }

  /**
   * Run an export job:
   * the elements should be an array of objects like this -
   * [{
   *    dataType: 'clinical',
   *    format: 'TSV',
   *    dataView: 'default' | 'surveyTable', // NTR specific
   * }]
   *
   * @param {string} jobId
   * @param {Constraint} targetConstraint
   * @param {TransmartExportElement[]} elements
   * @param {TransmartTableState} tableState - included only, if at least one of the formats of elements is 'TSV'
   * @returns {Observable<TransmartExportJob>}
   */
  runExportJob(jobId: string,
               targetConstraint: Constraint,
               elements: TransmartExportElement[],
               tableState?: TransmartTableState): Observable<TransmartExportJob> {
    const urlPart = `export/${jobId}/run`;
    const responseField = 'exportJob';
    let body = {
      constraint: TransmartConstraintMapper.mapConstraint(targetConstraint),
      elements: elements
    };
    if (tableState) {
      body['tableConfig'] = tableState;
    }
    return this.httpHelper.postCall(urlPart, body, responseField);
  }

  /**
   * Run an export specific for the surveyTable mode
   * @param jobId
   * @param targetConstraint
   * @param elements
   * @param dateColumnsIncluded
   * @returns {Observable<TransmartExportJob>}
   */
  runSurveyTableExportJob(jobId: string,
                          targetConstraint: Constraint,
                          elements: TransmartExportElement[],
                          dateColumnsIncluded: boolean): Observable<TransmartExportJob> {
    const urlPart = `export/${jobId}/run`;
    const responseField = 'exportJob';
    let body = {
      constraint: TransmartConstraintMapper.mapConstraint(targetConstraint),
      elements: elements,
      includeMeasurementDateColumns: dateColumnsIncluded
    };
    return this.httpHelper.postCall(urlPart, body, responseField);
  }

  /**
   * Given an export job id, return the blob (zipped file) ready to be used on frontend
   * @param jobId
   * @returns {Observable<blob>}
   */
  downloadExportJob(jobId: string): Observable<Blob> {
    let urlPart = `export/${jobId}/download`;
    return this.httpHelper.downloadData(urlPart);
  }

  /**
   * Cancels an export job with the given export job id
   * @param jobId
   * @returns {Observable<blob>}
   */
  cancelExportJob(jobId: string): Observable<{}> {
    const urlPart = `export/${jobId}/cancel`;
    const responseField = 'exportJob';
    return this.httpHelper.postCall(urlPart, {}, responseField);
  }

  /**
   * Removes an export job from the jobs table
   * @param jobId
   * @returns {Observable<blob>}
   */
  archiveExportJob(jobId: string): Observable<{}> {
    const urlPart = `export/${jobId}`;
    return this.httpHelper.deleteCall(urlPart);
  }


  // -------------------------------------- patient set calls --------------------------------------
  savePatientSet(name: string, constraint: Constraint): Observable<SubjectSet> {
    const urlPart = `patient_sets?name=${name}&reuse=true`;
    const body = TransmartConstraintMapper.mapConstraint(constraint);
    return this.httpHelper.postCall(urlPart, body, null);
  }

  // -------------------------------------- data table ---------------------------------------------
  getDataTable(tableState: TransmartTableState,
               constraint: Constraint,
               offset: number, limit: number): Observable<TransmartDataTable> {
    const urlPart = `observations/table`;
    let body = {
      type: 'clinical',
      constraint: TransmartConstraintMapper.mapConstraint(constraint),
      rowDimensions: tableState.rowDimensions,
      columnDimensions: tableState.columnDimensions,
      offset: offset,
      limit: limit,
      rowSort: tableState.rowSort,
      columnSort: tableState.columnSort
    };
    return this.httpHelper.postCall(urlPart, body, null);
  }

  getStudyIds(constraint: Constraint): Observable<string[]> {
    const urlPart = `dimensions/study/elements`;
    const body = {constraint: TransmartConstraintMapper.mapConstraint(constraint)};
    const responseField = 'elements';
    return this.httpHelper.postCall(urlPart, body, responseField).pipe(map(
      (elements: TransmartStudyDimensionElement[]) => elements.map(element => element.name)
    ));
  }

  getCrossTable(baseConstraint: Constraint,
                rowConstraints: Constraint[],
                columnConstraints: Constraint[]): Observable<TransmartCrossTable> {
    const urlPart = 'observations/crosstable';
    const body = {
      subjectConstraint: TransmartConstraintMapper.mapConstraint(baseConstraint),
      rowConstraints: rowConstraints.map(constraint => TransmartConstraintMapper.mapConstraint(constraint)),
      columnConstraints: columnConstraints.map(constraint => TransmartConstraintMapper.mapConstraint(constraint))
    };
    return this.httpHelper.postCall(urlPart, body, null);
  }

  // -------------------------------------- dimension calls --------------------------------------

  /**
   * Get a list of all dimensions supported by transmart.
   */
  getDimensions(): Observable<TransmartDimension[]> {
    const urlPart = 'dimensions';
    const responseField = 'dimensions';
    return this.httpHelper.getCall(urlPart, responseField);
  }

}
