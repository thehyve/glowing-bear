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
import {HttpErrorResponse} from '@angular/common/http';
import {Dimension} from '../models/table-models/dimension';
import {TransmartStudyDimensions} from "../models/transmart-models/transmart-study-dimensions";


@Injectable()
export class ResourceService {

  constructor(private transmartResourceService: TransmartResourceService) {
  }

  /**
   * handles error
   * @param {HttpErrorResponse | any} error
   */
  public handleError(res: HttpErrorResponse | any) {
    const status = res['status'];
    const url = res['url'];
    const message = res['message'];
    const summary = `Status: ${status}\nurl: ${url}\nMessage: ${message}`;
    console.error(summary);
    console.error(res['error']);
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
            if (fileFormat.name === 'TSV') {
              includeDataTable = true;
            }
            hasSelectedFormat = true;
          }
        }
      }
    }
    if (hasSelectedFormat) {
      const transmartTableState: TransmartTableState = includeDataTable ? TransmartMapper.mapDataTableToTableState(dataTable) : null;
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
  getDataTable(dataTable: DataTable): Observable<DataTable> {
    let isUsingHeaders = dataTable.isUsingHeaders;
    let offset = dataTable.offset;
    let limit = dataTable.limit;

    return this.getDimensions(dataTable.constraint).switchMap((transmartStudyDimensions: TransmartStudyDimensions) => {
      let tableState: TransmartTableState = TransmartMapper.mapStudyDimensionsToTableState(transmartStudyDimensions);
      const constraint: Constraint = dataTable.constraint;
      return this.transmartResourceService.getDataTable(tableState, constraint, offset, limit)
    }, (transmartStudyDimensions: TransmartStudyDimensions, transmartTable: TransmartDataTable) => {
      return TransmartMapper.mapTransmartDataTable(transmartTable, isUsingHeaders, offset, limit)
    });
  }

  /**
   * Gets available dimensions for step 3
   * @param {Constraint} constraint
   * @returns {Observable<Dimension[]>}
   */
  private getDimensions(constraint: Constraint): Observable<TransmartStudyDimensions> {
    return this.transmartResourceService.getStudyNames(constraint)
      .switchMap((studyElements: TransmartStudyDimensionElement[]) => {
        let studyNames: string[] = TransmartMapper.mapTransmartStudyDimensionElements(studyElements);
        return this.transmartResourceService.getAvailableDimensions(studyNames);
      }, (studyElements: TransmartStudyDimensionElement[], transmartStudies: TransmartStudy[]) => {
        return TransmartMapper.mapStudyDimensions(transmartStudies);
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

}
