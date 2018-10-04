/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {of as observableOf, from as observableFrom, throwError as observableThrowError, Observable} from 'rxjs';

import {switchMap, map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {Study} from '../models/constraint-models/study';
import {Constraint} from '../models/constraint-models/constraint';
import {TrialVisit} from '../models/constraint-models/trial-visit';
import {ExportJob} from '../models/export-models/export-job';
import {Query} from '../models/query-models/query';
import {SubjectSet} from '../models/constraint-models/subject-set';
import {Pedigree} from '../models/constraint-models/pedigree';
import {TransmartTableState} from '../models/transmart-models/transmart-table-state';
import {TransmartDataTable} from '../models/transmart-models/transmart-data-table';
import {TransmartResourceService} from './transmart-services/transmart-resource.service';
import {TransmartQuery} from '../models/transmart-models/transmart-query';
import {DataTable} from '../models/table-models/data-table';
import {TransmartMapper} from '../utilities/transmart-utilities/transmart-mapper';
import {ExportDataType} from '../models/export-models/export-data-type';
import {Dimension} from '../models/table-models/dimension';
import {TransmartStudyDimensions} from '../models/transmart-models/transmart-study-dimensions';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {Aggregate} from '../models/aggregate-models/aggregate';
import {CrossTable} from '../models/table-models/cross-table';
import {TransmartCrossTable} from '../models/transmart-models/transmart-cross-table';
import {ConstraintHelper} from '../utilities/constraint-utilities/constraint-helper';
import {CountItem} from '../models/aggregate-models/count-item';
import {TransmartCrossTableMapper} from '../utilities/transmart-utilities/transmart-cross-table-mapper';
import {TransmartDataTableMapper} from '../utilities/transmart-utilities/transmart-data-table-mapper';
import {TransmartCountItem} from '../models/transmart-models/transmart-count-item';
import {EndpointMode} from '../models/endpoint-mode';
import {TransmartStudy} from '../models/transmart-models/transmart-study';
import {TransmartTrialVisit} from '../models/transmart-models/transmart-trial-visit';
import {CategoricalAggregate} from '../models/aggregate-models/categorical-aggregate';
import {TransmartExternalJobResourceService} from './transmart-services/transmart-external-job-resource.service';
import {TransmartExternalJobMapper} from '../utilities/transmart-utilities/transmart-external-job-mapper';
import {TransmartExternalJob} from '../models/transmart-models/transmart-external-job';

@Injectable()
export class ResourceService {

  private _endpointMode: EndpointMode;
  private _inclusionCounts: CountItem;
  private _exclusionCounts: CountItem;
  private _selectedStudyConceptCountMap: Map<string, Map<string, CountItem>>;
  private _selectedConceptCountMap: Map<string, CountItem>;

  constructor(private transmartResourceService: TransmartResourceService,
              private transmartExternalJobResourceService: TransmartExternalJobResourceService) {
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
        return observableFrom(this.transmartResourceService.studies).pipe(
          map((tmStudies: TransmartStudy[]) => {
            return TransmartMapper.mapTransmartStudies(tmStudies);
          }));
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
          this.transmartResourceService.updateInclusionExclusionCounts(constraint, inclusionConstraint, exclusionConstraint)
            .then(() => {
              this.inclusionCounts =
                TransmartMapper.mapTransmartCountItem(this.transmartResourceService.inclusionCounts);
              this.exclusionCounts =
                TransmartMapper.mapTransmartCountItem(this.transmartResourceService.exclusionCounts);
              this.selectedStudyConceptCountMap =
                TransmartMapper.mapStudyConceptCountObject(this.transmartResourceService.studyConceptCountObject);
              this.selectedConceptCountMap =
                TransmartMapper.mapConceptCountObject(this.transmartResourceService.conceptCountObject);
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
        if (this.transmartResourceService.exportDataView === 'customFormat') {
          return this.transmartExternalJobResourceService.getExportDataTypes()
        } else {
          return this.transmartResourceService.getExportFileFormats().pipe(
            switchMap(fileFormatNames => {
              return this.transmartResourceService.getExportDataFormats(constraint)
            }, (fileFormatNames, dataFormatNames) => {
              return TransmartMapper.mapTransmartExportFormats(fileFormatNames, dataFormatNames);
            }));
        }
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
  getExportJobs(): Observable<any[]> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        if (this.transmartResourceService.exportDataView === 'customFormat') {
          return this.transmartExternalJobResourceService.getAllJobs().pipe(
            map((tmExJobs: TransmartExternalJob[]) => {
              return TransmartExternalJobMapper.mapCustomExportJobs(tmExJobs);
            }));
        } else {
          return this.transmartResourceService.getExportJobs();
        }
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
        if (this.transmartResourceService.exportDataView === 'customFormat') {
          return this.transmartExternalJobResourceService.createExportJob(name);
        } else {
          return this.transmartResourceService.createExportJob(name);
        }
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
               dataTable: DataTable): Observable<ExportJob> {
    let includeDataTable = false;
    let hasSelectedFormat = false;
    for (let dataType of dataTypes) {
      if (dataType.checked) {
        for (let fileFormat of dataType.fileFormats) {
          if (fileFormat.checked) {
            if (fileFormat.name === 'TSV' && dataType.name === 'clinical') {
              includeDataTable = true;
            }
            hasSelectedFormat = true;
          }
        }
      }
    }
    if (hasSelectedFormat) {
      switch (this.endpointMode) {
        case EndpointMode.TRANSMART: {
          if (this.transmartResourceService.exportDataView === 'customFormat') {
            return this.transmartExternalJobResourceService.runJob(job.id, constraint).pipe(
              map((tmExJob: TransmartExternalJob) => {
                return TransmartExternalJobMapper.mapCustomExportJob(tmExJob);
              }));
          } else {
            let transmartTableState: TransmartTableState = null;
            if (includeDataTable) {
              transmartTableState = TransmartDataTableMapper.mapDataTableToTableState(dataTable);
            }
            const elements = TransmartMapper.mapExportDataTypes(dataTypes, this.transmartResourceService.exportDataView);
            return this.transmartResourceService.runExportJob(job.id, constraint, elements, transmartTableState);
          }
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
  downloadExportJob(jobId: string) {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        if (this.transmartResourceService.exportDataView === 'customFormat') {
          return this.transmartExternalJobResourceService.downloadJobData(jobId);
        }
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
        if (this.transmartResourceService.exportDataView === 'customFormat') {
          return this.transmartExternalJobResourceService.cancelJob(jobId);
        }
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
        if (this.transmartResourceService.exportDataView === 'customFormat') {
          return this.transmartExternalJobResourceService.archiveJob(jobId);
        } else {
          return this.transmartResourceService.archiveExportJob(jobId);
        }
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  // -------------------------------------- query calls --------------------------------------
  /**
   * Get the queries that the current user has saved.
   * @returns {Observable<TransmartQuery[]>}
   */
  getQueries(): Observable<Query[]> {
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
   * @param {Query} query
   * @returns {Observable<Query>}
   */
  saveQuery(query: Query): Observable<Query> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        let transmartQuery: TransmartQuery = TransmartMapper.mapQuery(query);
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
   * Modify an existing query.
   * @param {string} queryId
   * @param {Object} queryBody
   * @returns {Observable<{}>}
   */
  updateQuery(queryId: string, queryBody: object): Observable<{}> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.updateQuery(queryId, queryBody);
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  /**
   * Delete an existing query.
   * @param {string} queryId
   * @returns {Observable<any>}
   */
  deleteQuery(queryId: string): Observable<{}> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.deleteQuery(queryId);
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

  // -------------------------------------- query differences --------------------------------------
  diffQuery(queryId: string): Observable<object[]> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.diffQuery(queryId);
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
        let offset = dataTable.offset;
        let limit = dataTable.limit;

        // Fetch dimensions for the data matching the constraint
        return this.getDimensions(dataTable.constraint).pipe(
          switchMap((transmartStudyDimensions: TransmartStudyDimensions) => {
            // Merge available dimensions and current table state
            let tableState: TransmartTableState =
              TransmartDataTableMapper.mapStudyDimensionsToTableState(transmartStudyDimensions, dataTable);
            const constraint: Constraint = dataTable.constraint;
            return this.transmartResourceService.getDataTable(tableState, constraint, offset, limit)
          }, (transmartStudyDimensions: TransmartStudyDimensions, transmartTable: TransmartDataTable) => {
            let newDataTable: DataTable = TransmartDataTableMapper.mapTransmartDataTable(transmartTable, offset, limit);
            newDataTable.constraint = dataTable.constraint;
            return newDataTable;
          }));
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

  /**
   * Gets available dimensions for step 3
   * @param {Constraint} constraint
   * @returns {Observable<Dimension[]>}
   */
  private getDimensions(constraint: Constraint): Observable<TransmartStudyDimensions> {
    // Fetch study names for the constraint
    return this.transmartResourceService.getStudyIds(constraint).pipe(
      switchMap(() => {
        // Fetch study details, including dimensions, for these studies
        return this.transmartResourceService.studies;
      }, (studyIds: string[], studies: TransmartStudy[]) => {
        if (studyIds && studies) {
          let selectedStudies = studies.filter(study => studyIds.includes(study.studyId));
          return TransmartMapper.mergeStudyDimensions(selectedStudies);
        } else {
          return new TransmartStudyDimensions();
        }
      }));
  }

  // TODO: refactor transmart speciic variables here, hide them from glowing bear
  get transmartExportDataView(): string {
    return this.transmartResourceService.exportDataView;
  }

  get transmartDateColumnIncluded(): boolean {
    return this.transmartResourceService.dateColumnsIncluded;
  }

  set transmartDateColumnIncluded(value: boolean) {
    this.transmartResourceService.dateColumnsIncluded = value;
  }

  // -------------------------------------- cross table ---------------------------------------------
  public getCrossTable(crossTable: CrossTable): Observable<CrossTable> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService
          .getCrossTable(
            crossTable.constraint,
            crossTable.rowHeaderConstraints.map(constraints => ConstraintHelper.combineSubjectLevelConstraints(constraints)),
            crossTable.columnHeaderConstraints.map(constraints => ConstraintHelper.combineSubjectLevelConstraints(constraints))).pipe(
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

  get selectedStudyConceptCountMap(): Map<string, Map<string, CountItem>> {
    return this._selectedStudyConceptCountMap;
  }

  set selectedStudyConceptCountMap(value: Map<string, Map<string, CountItem>>) {
    this._selectedStudyConceptCountMap = value;
  }

  get selectedConceptCountMap(): Map<string, CountItem> {
    return this._selectedConceptCountMap;
  }

  set selectedConceptCountMap(value: Map<string, CountItem>) {
    this._selectedConceptCountMap = value;
  }

  get endpointMode(): EndpointMode {
    return this._endpointMode;
  }

  set endpointMode(value: EndpointMode) {
    this._endpointMode = value;
  }
}
