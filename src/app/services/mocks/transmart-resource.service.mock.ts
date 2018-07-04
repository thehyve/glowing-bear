import {Observable} from 'rxjs/Observable';
import {Study} from '../../models/constraint-models/study';
import {ExportJob} from '../../models/export-models/export-job';
import {Query} from '../../models/query-models/query';
import {TransmartCrossTable} from '../../models/transmart-models/transmart-cross-table';
import {Constraint} from '../../models/constraint-models/constraint';
import {TransmartTableState} from '../../models/transmart-models/transmart-table-state';
import {TransmartDataTable} from '../../models/transmart-models/transmart-data-table';
import {TransmartConstraintMapper} from '../../utilities/transmart-utilities/transmart-constraint-mapper';

export class TransmartResourceServiceMock {
  private _studies: Study[];
  private pedigreeRelationTypes: object[];
  private queries: Query[];
  private treeNodes: object[];
  private exportJobs: ExportJob[];

  constructor() {
    this._studies = [];
    this.pedigreeRelationTypes = [];
    this.queries = [];
    this.treeNodes = [];
    this.exportJobs = [];
  }

  getStudies(): Observable<Study[]> {
    return Observable.of(this._studies);
  }

  get studies(): Promise<Study[]> {
    return Observable.of(this._studies).toPromise();
  }

  getPedigreeRelationTypes(): Observable<object[]> {
    return Observable.of(this.pedigreeRelationTypes);
  }

  getQueries(): Observable<Query[]> {
    return Observable.of(this.queries);
  }

  getTreeNodes(root: string, depth: number, hasCounts: boolean, hasTags: boolean): Observable<object> {
    return Observable.of(this.treeNodes);
  }

  getExportJobs(): Observable<ExportJob[]> {
    return Observable.of(this.exportJobs);
  }

  logout() {
    return Observable.of({});
  }

  getStudyIds(constraint: Constraint): Observable<string[]> {
    return Observable.of([]);
  }

  getDataTable(tableState: TransmartTableState,
               constraint: Constraint,
               offset: number, limit: number): Observable<TransmartDataTable> {
    let dataTableResult = new TransmartDataTable();
    return Observable.of(dataTableResult);
  }

  getCrossTable(baseConstraint: Constraint,
                rowConstraints: Constraint[],
                columnConstraints: Constraint[]): Observable<TransmartCrossTable> {
    let crossTableResult = new TransmartCrossTable();
    crossTableResult.rows = [[0]];
    return Observable.of(crossTableResult);
  }

  getCountsPerStudyAndConcept(constraint: Constraint): Observable<object> {
    return Observable.of({});
  }

  getCountsPerStudy(constraint: Constraint): Observable<object> {
    return Observable.of({});
  }

  getCountsPerConcept(constraint: Constraint): Observable<object> {
    return Observable.of({});
  }

  getCounts(constraint: Constraint): Observable<object> {
    return Observable.of({});
  }

  getExportFileFormats(): Observable<string[]> {
    return Observable.of(['tsv', 'csv']);
  }

  getExportDataFormats(constraint: Constraint): Observable<string[]> {
    return Observable.of([]);
  }
}
