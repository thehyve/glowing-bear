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
import {PedigreeRelationTypeResponse} from '../models/response-models/pedigree-relation-type-response';
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


@Injectable()
export class ResourceService {

  constructor(private transmartResourceService: TransmartResourceService) {
  }

  // -------------------------------------- tree node calls --------------------------------------
  /**
   * Returns the available studies.
   * @returns {Observable<Study[]>}
   */
  getStudies(): Observable<Study[]> {
    return Observable.fromPromise(this.transmartResourceService.studies);
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
    return this.transmartResourceService.getTreeNodes(root, depth, hasCounts, hasTags);
  }

  // -------------------------------------- observations calls --------------------------------------
  /**
   * Given a constraint, get the patient counts and observation counts
   * organized per study, then per concept
   * @param {Constraint} constraint
   * @returns {Observable<Object>}
   */
  getCountsPerStudyAndConcept(constraint: Constraint): Observable<Map<string, Map<string, CountItem>> > {
    return this.transmartResourceService.getCountsPerStudyAndConcept(constraint)
      .map((response: object) => {
        return TransmartMapper.mapStudyConceptCountObject(response);
      })
  }

  /**
   * Give a constraint, get the patient counts and observation counts
   * organized per study
   * @param {Constraint} constraint
   * @returns {Observable<Map<string, CountItem>>}
   */
  getCountsPerStudy(constraint: Constraint): Observable<Map<string, CountItem>> {
    return this.transmartResourceService.getCountsPerStudy(constraint)
      .map((response: object) => {
        return TransmartMapper.mapStudyCountObject(response);
      })
  }

  /**
   * Give a constraint, get the map from concept code to subject+observation counts
   * @param {Constraint} constraint
   * @returns {Observable<Map<string, CountItem>>}
   */
  getCountsPerConcept(constraint: Constraint): Observable<Map<string, CountItem>> {
    return this.transmartResourceService.getCountsPerConcept(constraint)
      .map((response: object) => {
        return TransmartMapper.mapConceptCountObject(response);
      })
  }

  // -------------------------------------- observation calls --------------------------------------
  /**
   * Give a constraint, get the corresponding patient count and observation count.
   * @param {Constraint} constraint
   * @returns {Observable<Object>}
   */
  getCounts(constraint: Constraint): Observable<object> {
    return this.transmartResourceService.getCounts(constraint);
  }

  // -------------------------------------- aggregate calls --------------------------------------
  /**
   * Get the aggregate based on the given constraint and aggregate options,
   * the options can be {min, max, count, values, average}
   * @param {Constraint} constraint
   * @returns {Observable<object>}
   */
  getAggregate(constraint: ConceptConstraint): Observable<Aggregate> {
    return this.transmartResourceService.getAggregate(constraint)
      .map((tmConceptAggregate: object) => {
        return TransmartMapper.mapTransmartConceptAggregate(tmConceptAggregate, constraint.concept.code);
      });
  }

  // -------------------------------------- trial visit calls --------------------------------------
  /**
   * Given a constraint, normally a concept or a study constraint, return the corresponding trial visit list
   * @param constraint
   * @returns {Observable<R|T>}
   */
  getTrialVisits(constraint: Constraint): Observable<TrialVisit[]> {
    return this.transmartResourceService.getTrialVisits(constraint);
  }

  // -------------------------------------- pedigree calls --------------------------------------
  /**
   * Get the available pedigree relation types such as parent, child, spouse, sibling and various twin types
   * @returns {Observable<Object[]>}
   */
  getPedigreeRelationTypes(): Observable<PedigreeRelationTypeResponse[]> {
    return this.transmartResourceService.getPedigreeRelationTypes();
  }

  // -------------------------------------- export calls --------------------------------------
  getExportDataTypes(constraint: Constraint): Observable<ExportDataType[]> {
    return this.transmartResourceService.getExportFileFormats()
      .switchMap(fileFormatNames => {
        return this.transmartResourceService.getExportDataFormats(constraint)
      }, (fileFormatNames, dataFormatNames) => {
        return TransmartMapper.mapTransmartExportFormats(fileFormatNames, dataFormatNames);
      });
  }

  /**
   * Get the current user's existing export jobs
   * @returns {Observable<ExportJob[]>}
   */
  getExportJobs(): Observable<any[]> {
    return this.transmartResourceService.getExportJobs();
  }

  /**
   * Create a new export job for the current user, with a given name
   * @param name
   * @returns {Observable<ExportJob>}
   */
  createExportJob(name: string): Observable<ExportJob> {
    return this.transmartResourceService.createExportJob(name);
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
      let transmartTableState: TransmartTableState = null;
      if (includeDataTable) {
        transmartTableState = TransmartDataTableMapper.mapDataTableToTableState(dataTable);
      }
      const elements = TransmartMapper.mapExportDataTypes(dataTypes, this.transmartResourceService.exportDataView);
      return this.transmartResourceService.runExportJob(job.id, constraint, elements, transmartTableState);
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
    return this.transmartResourceService.downloadExportJob(jobId);
  }

  /**
   * Cancels an export job with the given export job id
   * @param jobId
   * @returns {Observable<blob>}
   */
  cancelExportJob(jobId: string): Observable<{}> {
    return this.transmartResourceService.cancelExportJob(jobId);
  }

  /**
   * Removes an export job from the jobs table
   * @param jobId
   * @returns {Observable<blob>}
   */
  archiveExportJob(jobId: string): Observable<{}> {
    return this.transmartResourceService.archiveExportJob(jobId);
  }

  // -------------------------------------- query calls --------------------------------------
  /**
   * Get the queries that the current user has saved.
   * @returns {Observable<TransmartQuery[]>}
   */
  getQueries(): Observable<Query[]> {
    return this.transmartResourceService.getQueries()
      .map((transmartQueries: TransmartQuery[]) => {
        return TransmartMapper.mapTransmartQueries(transmartQueries);
      });
  }

  /**
   * Save a new query.
   * @param {Query} query
   * @returns {Observable<Query>}
   */
  saveQuery(query: Query): Observable<Query> {
    let transmartQuery: TransmartQuery = TransmartMapper.mapQuery(query);
    return this.transmartResourceService.saveQuery(transmartQuery)
      .map((savedTransmartQuery: TransmartQuery) => {
        return TransmartMapper.mapTransmartQuery(savedTransmartQuery);
      });
  }

  /**
   * Modify an existing query.
   * @param {string} queryId
   * @param {Object} queryBody
   * @returns {Observable<{}>}
   */
  updateQuery(queryId: string, queryBody: object): Observable<{}> {
    return this.transmartResourceService.updateQuery(queryId, queryBody);
  }

  /**
   * Delete an existing query.
   * @param {string} queryId
   * @returns {Observable<any>}
   */
  deleteQuery(queryId: string): Observable<{}> {
    return this.transmartResourceService.deleteQuery(queryId);
  }

  // -------------------------------------- patient set calls --------------------------------------
  saveSubjectSet(name: string, constraint: Constraint): Observable<SubjectSet> {
    return this.transmartResourceService.savePatientSet(name, constraint);
  }

  // -------------------------------------- query differences --------------------------------------
  diffQuery(queryId: string): Observable<object[]> {
    return this.transmartResourceService.diffQuery(queryId);
  }

  // -------------------------------------- data table ---------------------------------------------
  getDataTable(dataTable: DataTable): Observable<DataTable> {
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

  get sortableDimensions(): Set<string> {
    return this.transmartResourceService.sortableDimensions;
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
      }, (studyIds: string[], studies: Study[]) => {
        if (studyIds && studies) {
          let selectedStudies = studies.filter(study => studyIds.includes(study.studyId));
          return TransmartMapper.mergeStudyDimensions(selectedStudies);
        } else {
          return new TransmartStudyDimensions();
        }
      });
  }

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
    return this.transmartResourceService
      .getCrossTable(
        crossTable.constraint,
        crossTable.rowHeaderConstraints.map(constraints => ConstraintHelper.combineSubjectLevelConstraints(constraints)),
        crossTable.columnHeaderConstraints.map(constraints => ConstraintHelper.combineSubjectLevelConstraints(constraints)))
      .map((tmCrossTable: TransmartCrossTable) => {
        return TransmartCrossTableMapper.mapTransmartCrossTable(tmCrossTable, crossTable);
      });
  }

}
