/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Observable, of as observableOf, throwError as observableThrowError} from 'rxjs';
import {map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {Study} from '../models/constraint-models/study';
import {Constraint} from '../models/constraint-models/constraint';
import {TrialVisit} from '../models/constraint-models/trial-visit';
import {ExportJob} from '../models/export-models/export-job';
import {Cohort} from '../models/cohort-models/cohort';
import {SubjectSet} from '../models/constraint-models/subject-set';
import {Pedigree} from '../models/constraint-models/pedigree';
import {TransmartQuery} from '../models/transmart-models/transmart-query';
import {DataTable} from '../models/table-models/data-table';
import {TransmartMapper} from '../utilities/transmart-utilities/transmart-mapper';
import {ExportDataType} from '../models/export-models/export-data-type';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {Aggregate} from '../models/aggregate-models/aggregate';
import {CrossTable} from '../models/table-models/cross-table';
import {TransmartCrossTable} from '../models/transmart-models/transmart-cross-table';
import {ConstraintHelper} from '../utilities/constraint-utilities/constraint-helper';
import {CountItem} from '../models/aggregate-models/count-item';
import {TransmartCrossTableMapper} from '../utilities/transmart-utilities/transmart-cross-table-mapper';
import {TransmartCountItem} from '../models/transmart-models/transmart-count-item';
import {EndpointMode} from '../models/endpoint-mode';
import {TransmartTrialVisit} from '../models/transmart-models/transmart-trial-visit';
import {CategoricalAggregate} from '../models/aggregate-models/categorical-aggregate';
import {TransmartResourceService} from './transmart-services/transmart-resource.service';
import {TransmartExportJob} from '../models/transmart-models/transmart-export-job';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {

  private _endpointMode: EndpointMode;
  private _inclusionCounts: CountItem;
  private _exclusionCounts: CountItem;

  constructor(private transmartResourceService: TransmartResourceService) {
    this.endpointMode = EndpointMode.TRANSMART;
  }

  handleEndpointModeError(): Observable<any> {
    const msg = 'Incorrect Endpoint Mode is used.';
    console.error(msg);
    return observableThrowError(new Error(msg));
  }

  // -------------------------------------- tree node calls --------------------------------------
  /**
   * Returns the available studies.
   * @returns {Observable<Study[]>}
   */
  getStudies(): Observable<Study[]> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.getStudies();
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
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
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.getTreeNodes(root, depth, hasCounts, hasTags);
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  // -------------------------------------- count calls --------------------------------------
  updateInclusionExclusionCounts(constraint: Constraint,
                                 inclusionConstraint: Constraint,
                                 exclusionConstraint?: Constraint): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      switch (this.endpointMode) {
        case EndpointMode.TRANSMART: {
          this.transmartResourceService
            .updateInclusionExclusionCounts(constraint, inclusionConstraint, exclusionConstraint)
            .then(() => {
              this.inclusionCounts =
                TransmartMapper.mapTransmartCountItem(this.transmartResourceService.inclusionCounts);
              this.exclusionCounts =
                TransmartMapper.mapTransmartCountItem(this.transmartResourceService.exclusionCounts);
              resolve(true);
            })
            .catch(err => {
              reject(err);
            });
          break;
        }
        default: {
          return this.handleEndpointModeError();
        }
      }
    });
  }

  /**
   * Given a constraint, get the patient counts and observation counts
   * organized per study, then per concept
   * @param {Constraint} constraint
   * @returns {Observable<Object>}
   */
  getCountsPerStudyAndConcept(constraint: Constraint): Observable<Map<string, Map<string, CountItem>>> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.getCountsPerStudyAndConcept(constraint).pipe(
          map((response: object) => {
            return TransmartMapper.mapStudyConceptCountObject(response);
          }));
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  /**
   * Give a constraint, get the patient counts and observation counts
   * organized per study
   * @param {Constraint} constraint
   * @returns {Observable<Map<string, CountItem>>}
   */
  getCountsPerStudy(constraint: Constraint): Observable<Map<string, CountItem>> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.getCountsPerStudy(constraint).pipe(
          map((response: object) => {
            return TransmartMapper.mapStudyCountObject(response);
          }));
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  /**
   * Give a constraint, get the map from concept code to subject+observation counts
   * @param {Constraint} constraint
   * @returns {Observable<Map<string, CountItem>>}
   */
  getCountsPerConcept(constraint: Constraint): Observable<Map<string, CountItem>> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.getCountsPerConcept(constraint).pipe(
          map((response: object) => {
            return TransmartMapper.mapConceptCountObject(response);
          }));
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  /**
   * Give a constraint, get the corresponding patient count and observation count.
   * @param {Constraint} constraint
   * @returns {Observable<Object>}
   */
  getCounts(constraint: Constraint): Observable<CountItem> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.getCounts(constraint).pipe(
          map((tmCountItem: TransmartCountItem) => {
            return TransmartMapper.mapTransmartCountItem(tmCountItem);
          }));
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  // -------------------------------------- aggregate calls --------------------------------------
  /**
   * Get the aggregate based on the given constraint and aggregate options,
   * the options can be {min, max, count, values, average}
   * @param {Constraint} constraint
   * @returns {Observable<object>}
   */
  getAggregate(constraint: ConceptConstraint): Observable<Aggregate> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.getAggregate(constraint).pipe(
          map((tmConceptAggregate: object) => {
            return TransmartMapper.mapTransmartConceptAggregate(tmConceptAggregate, constraint.concept.code);
          }));
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  getCategoricalAggregate(constraint: ConceptConstraint): Observable<CategoricalAggregate> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.getCategoricalAggregate(constraint).pipe(
          map((tmConceptAggregate: object) => {
            return TransmartMapper.mapTransmartCategoricalConceptAggregate(tmConceptAggregate, constraint.concept.code);
          }));
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  // -------------------------------------- trial visit calls --------------------------------------
  /**
   * Given a constraint, normally a concept or a study constraint, return the corresponding trial visit list
   * @param constraint
   * @returns {Observable<R|T>}
   */
  getTrialVisits(constraint: Constraint): Observable<TrialVisit[]> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.getTrialVisits(constraint).pipe(
          map((tmTrialVisits: TransmartTrialVisit[]) => {
            return TransmartMapper.mapTransmartTrialVisits(tmTrialVisits);
          }));
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  // -------------------------------------- pedigree calls --------------------------------------
  /**
   * Get the available pedigree relation types such as parent, child, spouse, sibling and various twin types
   * @returns {Observable<Object[]>}
   */
  getPedigrees(): Observable<Pedigree[]> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.getPedigrees();
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  // -------------------------------------- export calls --------------------------------------
  getExportDataTypes(constraint: Constraint): Observable<ExportDataType[]> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.getExportDataTypes(constraint);
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  /**
   * Get the current user's existing export jobs
   * @returns {Observable<ExportJob[]>}
   */
  getExportJobs(): Observable<ExportJob[]> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.getExportJobs().pipe(
          map((tmExportJobs: TransmartExportJob[]) => {
            return TransmartMapper.mapTransmartExportJobs(tmExportJobs);
          })
        );
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  /**
   * Create a new export job for the current user, with a given name
   * @param name
   * @returns {Observable<ExportJob>}
   */
  createExportJob(name: string): Observable<ExportJob> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.createExportJob(name).pipe(
          map((tmExportJob: TransmartExportJob) => {
            return TransmartMapper.mapTransmartExportJob(tmExportJob);
          })
        );
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  /**
   * Run an export job
   * @param {ExportJob} job
   * @param {ExportDataType[]} dataTypes
   * @param {Constraint} constraint
   * @param {DataTable} dataTable - included only if at least one of the formats of elements is 'TSV'
   * @returns {Observable<ExportJob>}
   */
  runExportJob(job: ExportJob,
               dataTypes: ExportDataType[],
               constraint: Constraint,
               dataTable: DataTable,
               dateColumnsIncluded: boolean): Observable<ExportJob> {
    let hasSelectedFormat = false;
    for (let dataType of dataTypes) {
      if (dataType.checked) {
        for (let fileFormat of dataType.fileFormats) {
          if (fileFormat.checked) {
            hasSelectedFormat = true;
          }
        }
      }
    }
    if (hasSelectedFormat) {
      switch (this.endpointMode) {
        case EndpointMode.TRANSMART: {
          return this.transmartResourceService
            .runExportJob(job.id, job.name, constraint, dataTypes, dataTable, dateColumnsIncluded).pipe(
              map((tmExportJob: TransmartExportJob) => {
                return TransmartMapper.mapTransmartExportJob(tmExportJob);
              })
            );
        }
        default: {
          return this.handleEndpointModeError();
        }
      }
    } else {
      return observableOf(null);
    }
  }

  /**
   * Given an export job id, return the blob (zipped file) ready to be used on frontend
   * @param jobId
   * @returns {Observable<blob>}
   */
  downloadExportJob(jobId: string): Observable<Blob> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.downloadExportJob(jobId);
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  /**
   * Cancels an export job with the given export job id
   * @param jobId
   * @returns {Observable<blob>}
   */
  cancelExportJob(jobId: string): Observable<{}> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.cancelExportJob(jobId);
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  /**
   * Removes an export job from the jobs table
   * @param jobId
   * @returns {Observable<blob>}
   */
  archiveExportJob(jobId: string): Observable<{}> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.archiveExportJob(jobId);
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  // -------------------------------------- cohort calls --------------------------------------
  /**
   * Get the queries that the current user has saved.
   * @returns {Observable<TransmartQuery[]>}
   */
  getCohorts(): Observable<Cohort[]> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.getQueries().pipe(
          map((transmartQueries: TransmartQuery[]) => {
            return TransmartMapper.mapTransmartQueries(transmartQueries);
          }));
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  /**
   * Save a new query.
   * @param {Cohort} query
   * @returns {Observable<Cohort>}
   */
  saveCohort(cohort: Cohort): Observable<Cohort> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        let transmartQuery: TransmartQuery = TransmartMapper.mapQuery(cohort);
        return this.transmartResourceService.saveQuery(transmartQuery).pipe(
          map((savedTransmartQuery: TransmartQuery) => {
            return TransmartMapper.mapTransmartQuery(savedTransmartQuery);
          }));
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  /**
   * Modify an existing cohort.
   * @param {string} id
   * @param {Object} body
   * @returns {Observable<{}>}
   */
  editCohort(id: string, body: object): Observable<{}> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.updateQuery(id, body);
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  /**
   * Delete an existing cohort.
   * @param {string} id
   * @returns {Observable<any>}
   */
  deleteCohort(id: string): Observable<{}> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.deleteQuery(id);
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  // -------------------------------------- patient set calls --------------------------------------
  saveSubjectSet(name: string, constraint: Constraint): Observable<SubjectSet> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.savePatientSet(name, constraint);
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  // -------------------------------------- cohort differences --------------------------------------
  diffCohort(id: string): Observable<object[]> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.diffQuery(id);
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  // -------------------------------------- data table ---------------------------------------------
  getDataTable(dataTable: DataTable): Observable<DataTable> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.getDataTable(dataTable);
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  get sortableDimensions(): Set<string> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.sortableDimensions;
      }
      default: {
        this.handleEndpointModeError();
      }
    }
  }

  get transmartExportDataView(): string {
    return this.transmartResourceService.exportDataView;
  }

  // -------------------------------------- cross table ---------------------------------------------
  public getCrossTable(crossTable: CrossTable): Observable<CrossTable> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService
          .getCrossTable(
            crossTable.constraint,
            crossTable.rowHeaderConstraints
              .map(constraints => ConstraintHelper.combineSubjectLevelConstraints(constraints)),
            crossTable.columnHeaderConstraints
              .map(constraints => ConstraintHelper.combineSubjectLevelConstraints(constraints)))
          .pipe(
            map((tmCrossTable: TransmartCrossTable) => {
              return TransmartCrossTableMapper.mapTransmartCrossTable(tmCrossTable, crossTable);
            }));
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }


  get inclusionCounts(): CountItem {
    return this._inclusionCounts;
  }

  set inclusionCounts(value: CountItem) {
    this._inclusionCounts = value;
  }

  get exclusionCounts(): CountItem {
    return this._exclusionCounts;
  }

  set exclusionCounts(value: CountItem) {
    this._exclusionCounts = value;
  }

  get endpointMode(): EndpointMode {
    return this._endpointMode;
  }

  set endpointMode(value: EndpointMode) {
    this._endpointMode = value;
  }

}
