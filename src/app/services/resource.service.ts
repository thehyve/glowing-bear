/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
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
import {AppConfig} from '../config/app.config';
import {PicSureResourceService} from './picsure-services/picsure-resource.service';
import {TransmartConstraintMapper} from '../utilities/transmart-utilities/transmart-constraint-mapper';

@Injectable()
export class ResourceService {

  private _endpointMode: EndpointMode;
  private _inclusionCounts: CountItem;
  private _exclusionCounts: CountItem;
  private _selectedStudyConceptCountMap: Map<string, Map<string, CountItem>>;

  constructor(private transmartResourceService: TransmartResourceService,
              private picSureResourceService: PicSureResourceService,
              private config: AppConfig) {
    this.endpointMode = EndpointMode[String(this.config.getConfig('endpoint-mode', 'transmart')).toUpperCase()];
    if (!this.endpointMode) {
      this.handleEndpointModeError(`endpoint-mode ${this.config.getConfig('endpoint-mode')} is invalid`);
    }

    switch (this.endpointMode) {
      case EndpointMode.PICSURE:
        this.picSureResourceService.init();
    }
  }

  handleEndpointModeError(msg?: string): Observable<any> {
    console.error(msg ? msg : 'endpoint error');
    return Observable.throw(new Error(msg));
  }

  // -------------------------------------- utilities calls --------------------------------------

  generateConstraintFromObject(constraintObjectInput: object): Constraint {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART:
        return TransmartConstraintMapper.generateConstraintFromObject(constraintObjectInput);

      case EndpointMode.PICSURE:
        this.handleEndpointModeError('Not supported: PIC-SURE does not support custom constraints from tree');
    }
  }

  // -------------------------------------- tree node calls --------------------------------------
  /**
   * Returns the available studies.
   * @returns {Observable<Study[]>}
   */
  getStudies(): Observable<Study[]> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return Observable.fromPromise(this.transmartResourceService.studies)
          .map((tmStudies: TransmartStudy[]) => {
            return TransmartMapper.mapTransmartStudies(tmStudies);
          });
      }
      default: {
        return this.handleEndpointModeError();
      }
    }
  }

  /**
   * Get tree nodes from the root
   * @param {number} depth - the depth of the tree we want to access
   * @param {boolean} hasCounts - whether we want to include patient and observation counts in the tree nodes
   * @param {boolean} hasTags - whether we want to include metadata in the tree nodes
   * @returns {Observable<Object>}
   */
  getRootTreeNodes(depth: number, hasCounts: boolean, hasTags: boolean): Observable<object> { // todo: to treenode
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART:
        return this.transmartResourceService.getTreeNodes('\\', depth, hasCounts, hasTags);

      case EndpointMode.PICSURE:
        return this.picSureResourceService.getRootTreeNodes();
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
  getChildTreeNodes(root: string, depth: number, hasCounts: boolean, hasTags: boolean): Observable<object> { // todo: to treenode
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART:
        return this.transmartResourceService.getTreeNodes(root, depth, hasCounts, hasTags);

      case EndpointMode.PICSURE:
        return this.picSureResourceService.getChildNodes(root);
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
        return this.transmartResourceService.getCountsPerStudyAndConcept(constraint)
          .map((response: object) => {
            return TransmartMapper.mapStudyConceptCountObject(response);
          });
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
        return this.transmartResourceService.getCountsPerStudy(constraint)
          .map((response: object) => {
            return TransmartMapper.mapStudyCountObject(response);
          });
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
        return this.transmartResourceService.getCountsPerConcept(constraint)
          .map((response: object) => {
            return TransmartMapper.mapConceptCountObject(response);
          });
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
        return this.transmartResourceService.getCounts(constraint)
          .map((tmCountItem: TransmartCountItem) => {
            return TransmartMapper.mapTransmartCountItem(tmCountItem);
          });
      }
      case EndpointMode.PICSURE:
        return this.picSureResourceService.getPatientsCounts(constraint);
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
        return this.transmartResourceService.getAggregate(constraint)
          .map((tmConceptAggregate: object) => {
            return TransmartMapper.mapTransmartConceptAggregate(tmConceptAggregate, constraint.concept.code);
          });
      }
      case EndpointMode.PICSURE:
        return this.picSureResourceService.getAggregate(constraint.concept);
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
        return this.transmartResourceService.getTrialVisits(constraint);
      }
      case EndpointMode.PICSURE:
        return Observable.of([]);
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
      case EndpointMode.PICSURE:
        return Observable.of([]);
    }
  }

  // -------------------------------------- export calls --------------------------------------
  getExportDataTypes(constraint: Constraint): Observable<ExportDataType[]> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.getExportFileFormats()
          .switchMap(fileFormatNames => {
            return this.transmartResourceService.getExportDataFormats(constraint)
          }, (fileFormatNames, dataFormatNames) => {
            return TransmartMapper.mapTransmartExportFormats(fileFormatNames, dataFormatNames);
          });
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
        return this.transmartResourceService.getExportJobs();
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
        return this.transmartResourceService.createExportJob(name);
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
          }
        }
      }
    }
    if (hasSelectedFormat) {
      switch (this.endpointMode) {
        case EndpointMode.TRANSMART: {
          let transmartTableState: TransmartTableState = null;
          if (includeDataTable) {
            transmartTableState = TransmartDataTableMapper.mapDataTableToTableState(dataTable);
          }
          const elements = TransmartMapper.mapExportDataTypes(dataTypes, this.transmartResourceService.exportDataView);
          return this.transmartResourceService.runExportJob(job.id, constraint, elements, transmartTableState);
        }
        default: {
          return this.handleEndpointModeError();
        }
      }
    } else {
      return Observable.of(null);
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

  // -------------------------------------- query calls --------------------------------------
  /**
   * Get the queries that the current user has saved.
   * @returns {Observable<TransmartQuery[]>}
   */
  getQueries(): Observable<Query[]> {
    switch (this.endpointMode) {
      case EndpointMode.TRANSMART: {
        return this.transmartResourceService.getQueries()
          .map((transmartQueries: TransmartQuery[]) => {
            return TransmartMapper.mapTransmartQueries(transmartQueries);
          });
      }
      case EndpointMode.PICSURE: {
        console.warn('getQueries() not supported');
        return Observable.of([]);
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
        return this.transmartResourceService.saveQuery(transmartQuery)
          .map((savedTransmartQuery: TransmartQuery) => {
            return TransmartMapper.mapTransmartQuery(savedTransmartQuery);
          });
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
        return this.getDimensions(dataTable.constraint)
          .switchMap((transmartStudyDimensions: TransmartStudyDimensions) => {
            // Merge available dimensions and current table state
            let tableState: TransmartTableState =
              TransmartDataTableMapper.mapStudyDimensionsToTableState(transmartStudyDimensions, dataTable);
            const constraint: Constraint = dataTable.constraint;
            return this.transmartResourceService.getDataTable(tableState, constraint, offset, limit)
          }, (transmartStudyDimensions: TransmartStudyDimensions, transmartTable: TransmartDataTable) => {
            let newDataTable: DataTable = TransmartDataTableMapper.mapTransmartDataTable(transmartTable, offset, limit);
            newDataTable.constraint = dataTable.constraint;
            return newDataTable;
          });
      }
      case EndpointMode.PICSURE: {
        console.warn('getDataTable() not supported');
        return Observable.of(dataTable);
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
    return this.transmartResourceService.getStudyIds(constraint)
      .switchMap(() => {
        // Fetch study details, including dimensions, for these studies
        return this.transmartResourceService.studies;
      }, (studyIds: string[], studies: TransmartStudy[]) => {
        if (studyIds && studies) {
          let selectedStudies = studies.filter(study => studyIds.includes(study.studyId));
          return TransmartMapper.mergeStudyDimensions(selectedStudies);
        } else {
          return new TransmartStudyDimensions();
        }
      });
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
            crossTable.columnHeaderConstraints.map(constraints => ConstraintHelper.combineSubjectLevelConstraints(constraints)))
          .map((tmCrossTable: TransmartCrossTable) => {
            return TransmartCrossTableMapper.mapTransmartCrossTable(tmCrossTable, crossTable);
          });
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

  get endpointMode(): EndpointMode {
    return this._endpointMode;
  }

  set endpointMode(value: EndpointMode) {
    this._endpointMode = value;
  }
}
