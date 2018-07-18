/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx'
import {Constraint} from '../../models/constraint-models/constraint';
import {Pedigree} from '../../models/constraint-models/pedigree';
import {TrialVisit} from '../../models/constraint-models/trial-visit';
import {ExportJob} from '../../models/export-models/export-job';
import {Query} from '../../models/query-models/query';
import {SubjectSet} from '../../models/constraint-models/subject-set';
import {TransmartTableState} from '../../models/transmart-models/transmart-table-state';
import {TransmartDataTable} from '../../models/transmart-models/transmart-data-table';
import {TransmartQuery} from '../../models/transmart-models/transmart-query';
import {TransmartStudyDimensionElement} from 'app/models/transmart-models/transmart-study-dimension-element';
import {AppConfig} from '../../config/app.config';
import {TransmartExportElement} from '../../models/transmart-models/transmart-export-element';
import {TransmartCrossTable} from '../../models/transmart-models/transmart-cross-table';
import {TransmartConstraintMapper} from '../../utilities/transmart-utilities/transmart-constraint-mapper';
import {ErrorHelper} from '../../utilities/error-helper';
import {AsyncSubject} from 'rxjs/AsyncSubject';
import {TransmartCountItem} from '../../models/transmart-models/transmart-count-item';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {TransmartStudy} from '../../models/transmart-models/transmart-study';


@Injectable()
export class TransmartResourceService {

  static sortableDimensions = new Set<string>([
    'patient', 'concept', 'start time', 'end time', 'visit', 'location', 'provider', 'study', 'trial visit'
  ]);

  // the export data view has an alternative 'surveyTable', specifically for NTR project
  private _exportDataView = 'default';
  private _dateColumnsIncluded = true;
  private _endpointUrl: string;

  private _studiesLock: boolean;
  private _studies: TransmartStudy[] = null;
  private _studiesSubject: AsyncSubject<TransmartStudy[]>;

  /*
   * Flag indicating if the subject selection of step 1 should be automatically
   * saved as subject set in the backend. If true, that subject set is used as the subject constraint
   * for step 2.
   */
  private _autosaveSubjectSets: boolean;
  private _subjectSetConstraint: SubjectSetConstraint;
  private _inclusionCounts: TransmartCountItem;
  private _exclusionCounts: TransmartCountItem;
  private _studyConceptCountObject: object;

  constructor(private appConfig: AppConfig,
              private http: HttpClient) {
    this.exportDataView = appConfig.getConfig('export-data-view', 'default');
    this.endpointUrl = `${this.appConfig.getConfig('api-url')}/${this.appConfig.getConfig('api-version')}`;
    this.autosaveSubjectSets = appConfig.getConfig('autosave-subject-sets', false);
    this.subjectSetConstraint = new SubjectSetConstraint();
    this.inclusionCounts = new TransmartCountItem();
    this.exclusionCounts = new TransmartCountItem();
  }

  get subjectSetConstraint(): SubjectSetConstraint {
    return this._subjectSetConstraint;
  }

  set subjectSetConstraint(value: SubjectSetConstraint) {
    this._subjectSetConstraint = value;
  }

  get exportDataView(): string {
    return this._exportDataView;
  }

  set exportDataView(value: string) {
    this._exportDataView = value;
  }

  get dateColumnsIncluded(): boolean {
    return this._dateColumnsIncluded;
  }

  set dateColumnsIncluded(value: boolean) {
    this._dateColumnsIncluded = value;
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

  get inclusionCounts(): TransmartCountItem {
    return this._inclusionCounts;
  }

  set inclusionCounts(value: TransmartCountItem) {
    this._inclusionCounts = value;
  }

  get exclusionCounts(): TransmartCountItem {
    return this._exclusionCounts;
  }

  set exclusionCounts(value: TransmartCountItem) {
    this._exclusionCounts = value;
  }

  get studyConceptCountObject(): object {
    return this._studyConceptCountObject;
  }

  set studyConceptCountObject(value: object) {
    this._studyConceptCountObject = value;
  }

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
      return this.http.post(url, body)
        .map(res => res[responseField])
        .catch(ErrorHelper.handleError.bind(this));
    } else {
      return this.http.post(url, body)
        .catch(ErrorHelper.handleError.bind(this));
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
      return this.http.get(url)
        .map(res => res[responseField])
        .catch(ErrorHelper.handleError.bind(this));
    } else {
      return this.http.get(url)
        .catch(ErrorHelper.handleError.bind(this));
    }
  }

  /**
   * Make a put http request
   * @param urlPart
   * @param body
   * @returns {Observable<any | any>}
   */
  private putCall(urlPart, body) {
    let url = `${this.endpointUrl}/${urlPart}`;
    return this.http.put(url, body)
      .catch(ErrorHelper.handleError.bind(this));
  }

  /**
   * Make a delete http request
   * @param urlPart
   * @returns {Observable<any | any>}
   */
  private deleteCall(urlPart) {
    let url = `${this.endpointUrl}/${urlPart}`;
    return this.http.delete(url)
      .catch(ErrorHelper.handleError.bind(this));
  }

  // -------------------------------------- tree node calls --------------------------------------
  /**
   * Returns the available studies.
   * @returns {Observable<Study[]>}
   */
  getStudies(): Observable<TransmartStudy[]> {
    const urlPart = 'studies';
    const responseField = 'studies';
    return this.getCall(urlPart, responseField);
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
      return Observable.of(this._studies).toPromise();
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
          ErrorHelper.handleError(error);
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
    return this.getCall(urlPart, responseField);
  }

  // -------------------------------------- count calls --------------------------------------
  /**
   * Update the inclusion and exclusion counts in subject selection
   * in an economical way.
   * Order of updates: study-concept-count object update -> exclusion count update -> inclusion count update
   * @param {Constraint} constraint
   * @param {Constraint} inclusionConstraint
   * @param {Constraint} exclusionConstraint
   * @returns {Promise<any>}
   */
  updateInclusionExclusionCounts(constraint: Constraint,
                                 inclusionConstraint: Constraint,
                                 exclusionConstraint?: Constraint): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (this.autosaveSubjectSets) {
        this.savePatientSet('temp', constraint)
          .subscribe((subjectSet: SubjectSet) => {
            this.subjectSetConstraint.id = subjectSet.id;
            this.subjectSetConstraint.setSize = subjectSet.setSize;
            this.updateStudyConceptCountObject(this.subjectSetConstraint, inclusionConstraint, exclusionConstraint)
              .then(() => {
                resolve(true);
              })
              .catch(err => {
                reject(false)
              });
          }, err => {
            reject(err)
          });
      } else {
        this.updateStudyConceptCountObject(constraint, inclusionConstraint, exclusionConstraint)
          .then(() => {
            resolve(true);
          })
          .catch(err => {
            reject(err)
          });
      }
    });
  }

  updateStudyConceptCountObject(constraint: Constraint,
                                inclusionConstraint: Constraint,
                                exclusionConstraint?: Constraint): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getCountsPerStudyAndConcept(constraint)
        .subscribe((countObj: object) => {
          this.studyConceptCountObject = countObj;
          let totalCountItem: TransmartCountItem = new TransmartCountItem();
          // if in autosaveSubjectSets mode, need to calculate total observation count
          if (this.autosaveSubjectSets) {
            let totalObservationCount = 0;
            for (let studyId in countObj) {
              let conceptCount: object = countObj[studyId];
              for (let conceptCode in conceptCount) {
                let countItem: TransmartCountItem = conceptCount[conceptCode];
                totalObservationCount += countItem.observationCount;
              }
            }
            totalCountItem.patientCount = this.subjectSetConstraint.setSize;
            totalCountItem.observationCount = totalObservationCount;
          }
          this.updateExclusionCounts(exclusionConstraint)
            .then(() => {
              this.updateInclusionCounts(inclusionConstraint, totalCountItem)
                .then(() => {
                  resolve(true);
                })
                .catch(err => {
                  reject('Fail to update transmart inclusion counts.');
                })
            })
            .catch(err => {
              reject('Fail to update transmart exclusion counts.')
            })
        }, err => {
          reject('Fail to retrieve study-concept-count object from transmart.')
        });
    });
  }

  updateExclusionCounts(constraint?: Constraint): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (constraint) {
        this.getCounts(constraint)
          .subscribe((countItem: TransmartCountItem) => {
            this.exclusionCounts.patientCount = countItem.patientCount;
            this.exclusionCounts.observationCount = countItem.observationCount;
            resolve(true);
          }, err => {
            reject(err);
          });
      } else {
        this.exclusionCounts.patientCount = 0;
        this.exclusionCounts.observationCount = 0;
        resolve(true);
      }
    });
  }

  updateInclusionCounts(constraint: Constraint, totalCountItem?: TransmartCountItem): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (this.autosaveSubjectSets) {
        if (totalCountItem) {
          this.inclusionCounts.patientCount = totalCountItem.patientCount + this.exclusionCounts.patientCount;
          this.inclusionCounts.observationCount = totalCountItem.observationCount + this.exclusionCounts.observationCount;
          resolve(true);
        } else {
          reject('Missing transmart total-count item to calculate inclusion counts.');
        }
      } else {
        this.getCounts(constraint)
          .subscribe((countItem: TransmartCountItem) => {
            this.inclusionCounts.patientCount = countItem.patientCount;
            this.inclusionCounts.observationCount = countItem.observationCount;
            resolve(true);
          }, err => {
            reject(err);
          })
      }
    });
  }

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
    return this.postCall(urlPart, body, responseField);
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
    return this.postCall(urlPart, body, responseField);
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
    return this.postCall(urlPart, body, responseField);
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
    return this.postCall(urlPart, body, responseField);
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
    return this.postCall(urlPart, body, responseField);
  }

  // -------------------------------------- trial visit calls --------------------------------------
  /**
   * Given a constraint, normally a concept or a study constraint, return the corresponding trial visit list
   * @param constraint
   * @returns {Observable<R|T>}
   */
  getTrialVisits(constraint: Constraint): Observable<TrialVisit[]> {
    const constraintString = JSON.stringify(TransmartConstraintMapper.mapConstraint(constraint));
    const urlPart = `dimensions/trial visit/elements?constraint=${constraintString}`;
    const responseField = 'elements';
    return this.getCall(urlPart, responseField);
  }

  // -------------------------------------- pedigree calls --------------------------------------
  /**
   * Get the available pedigree relation types such as parent, child, spouse, sibling and various twin types
   * @returns {Observable<Object[]>}
   */
  getPedigrees(): Observable<Pedigree[]> {
    const urlPart = 'pedigree/relation_types';
    const responseField = 'relationTypes';
    return this.getCall(urlPart, responseField);
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
    return this.postCall(urlPart, body, responseField);
  }

  getExportFileFormats(): Observable<string[]> {
    const dataView = this.exportDataView;
    const urlPart = `export/file_formats?dataView=${dataView}`;
    const responseField = 'fileFormats';
    return this.getCall(urlPart, responseField);
  }

  /**
   * Get the current user's existing export jobs
   * @returns {Observable<ExportJob[]>}
   */
  getExportJobs(): Observable<any[]> {
    const urlPart = 'export/jobs';
    const responseField = 'exportJobs';
    return this.getCall(urlPart, responseField);
  }

  /**
   * Create a new export job for the current user, with a given name
   * @param name
   * @returns {Observable<ExportJob>}
   */
  createExportJob(name: string): Observable<ExportJob> {
    const urlPart = `export/job?name=${name}`;
    const responseField = 'exportJob';
    return this.postCall(urlPart, {}, responseField);
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
   * @param {Constraint} constraint
   * @param {TransmartExportElement[]} elements
   * @param {TransmartTableState} tableState - included only, if at least one of the formats of elements is 'TSV'
   * @returns {Observable<ExportJob>}
   */
  runExportJob(jobId: string,
               constraint: Constraint,
               elements: TransmartExportElement[],
               tableState?: TransmartTableState): Observable<ExportJob> {
    const urlPart = `export/${jobId}/run`;
    const responseField = 'exportJob';
    let body = {
      constraint: TransmartConstraintMapper.mapConstraint(constraint),
      elements: elements,
      includeMeasurementDateColumns: this.dateColumnsIncluded
    };
    if (tableState) {
      body['tableConfig'] = tableState;
    }
    return this.postCall(urlPart, body, responseField);
  }

  /**
   * Given an export job id, return the blob (zipped file) ready to be used on frontend
   * @param jobId
   * @returns {Observable<blob>}
   */
  downloadExportJob(jobId: string) {
    let url = `${this.endpointUrl}/export/${jobId}/download`;
    return this.http.get(url, {responseType: 'blob'})
      .catch(ErrorHelper.handleError.bind(this));
  }

  /**
   * Cancels an export job with the given export job id
   * @param jobId
   * @returns {Observable<blob>}
   */
  cancelExportJob(jobId: string): Observable<{}> {
    const urlPart = `export/${jobId}/cancel`;
    const responseField = 'exportJob';
    return this.postCall(urlPart, {}, responseField);
  }

  /**
   * Removes an export job from the jobs table
   * @param jobId
   * @returns {Observable<blob>}
   */
  archiveExportJob(jobId: string): Observable<{}> {
    const urlPart = `export/${jobId}`;
    return this.deleteCall(urlPart);
  }

  // -------------------------------------- query calls --------------------------------------
  /**
   * Get the queries that the current user has saved.
   * @returns {Observable<Query[]>}
   */
  getQueries(): Observable<TransmartQuery[]> {
    const urlPart = `queries`;
    const responseField = 'queries';
    return this.getCall(urlPart, responseField);
  }

  /**
   * save a new query
   * @param {TransmartQuery} transmartQuery
   * @returns {Observable<TransmartQuery>}
   */
  saveQuery(transmartQuery: TransmartQuery): Observable<TransmartQuery> {
    const urlPart = `queries`;
    const queryBody = {};
    if (transmartQuery.name) {
      queryBody['name'] = transmartQuery.name;
    }
    if (transmartQuery.patientsQuery) {
      queryBody['patientsQuery'] = transmartQuery.patientsQuery;
    }
    if (transmartQuery.observationsQuery) {
      queryBody['observationsQuery'] = transmartQuery.observationsQuery;
    }
    if (transmartQuery.bookmarked) {
      queryBody['bookmarked'] = transmartQuery.bookmarked;
    }
    if (transmartQuery.subscribed) {
      queryBody['subscribed'] = transmartQuery.subscribed;
    }
    if (transmartQuery.subscriptionFreq) {
      queryBody['subscriptionFreq'] = transmartQuery.subscriptionFreq;
    }
    if (transmartQuery.queryBlob) {
      queryBody['queryBlob'] = transmartQuery.queryBlob;
    }
    return this.postCall(urlPart, queryBody, null);
  }

  /**
   * Modify an existing query.
   * @param {string} queryId
   * @param {Object} queryBody
   * @returns {Observable<Query>}
   */
  updateQuery(queryId: string, queryBody: object): Observable<{}> {
    const urlPart = `queries/${queryId}`;
    return this.putCall(urlPart, queryBody);
  }

  /**
   * Delete an existing query.
   * @param {string} queryId
   * @returns {Observable<any>}
   */
  deleteQuery(queryId: string): Observable<{}> {
    const urlPart = `queries/${queryId}`;
    return this.deleteCall(urlPart);
  }

  // -------------------------------------- patient set calls --------------------------------------
  savePatientSet(name: string, constraint: Constraint): Observable<SubjectSet> {
    const urlPart = `patient_sets?name=${name}&reuse=true`;
    const body = TransmartConstraintMapper.mapConstraint(constraint);
    return this.postCall(urlPart, body, null);
  }

  // -------------------------------------- query differences --------------------------------------
  diffQuery(queryId: string): Observable<object[]> {
    const urlPart = `queries/${queryId}/sets`;
    const responseField = 'querySets';
    return this.getCall(urlPart, responseField);
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
    return this.postCall(urlPart, body, null);
  }

  getStudyIds(constraint: Constraint): Observable<string[]> {
    const urlPart = `dimensions/study/elements`;
    const body = {constraint: TransmartConstraintMapper.mapConstraint(constraint)};
    const responseField = 'elements';
    return this.postCall(urlPart, body, responseField).map(
      (elements: TransmartStudyDimensionElement[]) => elements.map(element => element.name)
    );
  }

  get sortableDimensions(): Set<string> {
    return TransmartResourceService.sortableDimensions;
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
    return this.postCall(urlPart, body, null);
  }

}
