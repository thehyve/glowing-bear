import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Study} from '../models/constraint-models/study';
import {Constraint} from '../models/constraint-models/constraint';
import {TrialVisit} from '../models/constraint-models/trial-visit';
import {ExportJob} from '../models/export-models/export-job';
import {Query} from '../models/query-models/query';
import {PatientSet} from '../models/constraint-models/patient-set';
import {PedigreeRelationTypeResponse} from '../models/constraint-models/pedigree-relation-type-response';
import {TransmartTableState} from '../models/transmart-models/transmart-table-state';
import {TransmartDataTable} from '../models/transmart-models/transmart-data-table';
import {TransmartResourceService} from './transmart-resource/transmart-resource.service';
import {TransmartQuery} from '../models/transmart-models/transmart-query';
import {DataTable} from '../models/table-models/data-table';
import {TransmartMapper} from './transmart-resource/transmart-mapper';
import {TransmartStudyDimensionElement} from '../models/transmart-models/transmart-study-dimension-element';
import {TransmartStudy} from '../models/transmart-models/transmart-study';
import {ExportDataType} from '../models/export-models/export-data-type';
import {ExportFileFormat} from '../models/export-models/export-file-format';

@Injectable()
export class ResourceService {


  constructor(private transmartResourceService: TransmartResourceService) {
  }

  /**
   * Logout from the authserver with a cookie attached
   * @returns {Observable<{}>}
   */
  logout(): Observable<{}> {
    return this.transmartResourceService.logout();
  }

  // -------------------------------------- tree node calls --------------------------------------
  /**
   * Returns the available studies.
   * @returns {Observable<Study[]>}
   */
  getStudies(): Observable<Study[]> {
    return this.transmartResourceService.getStudies();
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
  getCountsPerStudyAndConcept(constraint: Constraint): Observable<object> {
    return this.transmartResourceService.getCountsPerStudyAndConcept(constraint);
  }

  /**
   * Give a constraint, get the patient counts and observation counts
   * organized per study
   * @param {Constraint} constraint
   * @returns {Observable<Object>}
   */
  getCountsPerStudy(constraint: Constraint): Observable<object> {
    return this.transmartResourceService.getCountsPerStudy(constraint);
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
  getAggregate(constraint: Constraint): Observable<object> {
    return this.transmartResourceService.getAggregate(constraint);
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
        console.log('fileFormatNames: ', fileFormatNames);
        return this.transmartResourceService.getExportDataFormats(constraint)
      }, (fileFormatNames, dataFormatNames) => {
        console.log('dataFormatNames: ', dataFormatNames)
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
   * Run an export job:
   * the elements should be an array of objects like this -
   * [{
   *    dataType: 'clinical',
   *    format: 'TSV',
   *    dataView: 'default' | 'surveyTable', // NTR specific
   * }]
   *
   * @param jobId
   * @param elements
   * @param constraint
   * @param includeMeasurementDateColumns
   * @param dataTable - included only, if at least one of the formats of elements is 'TSV'
   * @returns {Observable<ExportJob>}
   */
  runExportJob(jobId: string,
               constraint: Constraint,
               elements: object[],
               dataTable?: DataTable): Observable<ExportJob> {
    const transmartTableState: TransmartTableState = dataTable ? TransmartMapper.mapDataTable(dataTable) : null;
    return this.transmartResourceService
      .runExportJob(jobId, constraint, elements, transmartTableState);
  }

  runExportJob(job: ExportJob,
               dataTypes: ExportDataType[],
               constraint: Constraint,
               dataTable?: DataTable): Observable<ExportJob> {
    return null;
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
      .map((newlySavedQuery: TransmartQuery) => {
        return TransmartMapper.mapTransmartQuery(newlySavedQuery);
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
  savePatientSet(name: string, constraint: Constraint): Observable<PatientSet> {
    return this.transmartResourceService.savePatientSet(name, constraint);
  }

  // -------------------------------------- query differences --------------------------------------
  diffQuery(queryId: string): Observable<object[]> {
    return this.transmartResourceService.diffQuery(queryId);
  }

  // -------------------------------------- data table ---------------------------------------------
  getDataTable(dataTable: DataTable, offset: number, limit: number): Observable<DataTable> {
    const transmartTableState: TransmartTableState
      = TransmartMapper.mapDataTable(dataTable);
    return this.transmartResourceService.getDataTable(transmartTableState, offset, limit)
      .map((transmartTable: TransmartDataTable) => {
        return TransmartMapper.mapTransmartDataTable(transmartTable);
      });
  }

  /**
   * Gets all elements from the study dimension that satisfy the constaint if given
   * @param {Constraint} constraint
   * @returns {Observable<string[]>}
   */
  getStudyNames(constraint: Constraint): Observable<string[]> {
    return this.transmartResourceService.getStudyNames(constraint)
      .map((elements: TransmartStudyDimensionElement[]) => {
        return TransmartMapper.mapTransmartStudyDimensionElements(elements);
      });
  }

  /**
   * Gets available dimensions for step 3
   * @param studyNames
   * @returns {Observable<string[]>}
   */
  getAvailableDimensions(studyNames: string[]): Observable<string[]> {
    return this.transmartResourceService.getAvailableDimensions(studyNames)
      .map((transmartStudies: TransmartStudy[]) => {
        let dimensions = [];
        transmartStudies.forEach((study: TransmartStudy) => {
          study.dimensions.forEach((dimension: string) => {
              if (dimensions.indexOf(dimension) === -1) {
                dimensions.push(dimension);
              }
            }
          );
        });
        return dimensions;
      });
  }
}
