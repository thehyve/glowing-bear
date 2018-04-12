import {Observable} from 'rxjs/Observable';
import {Study} from '../../models/constraint-models/study';
import {ExportJob} from '../../models/export-models/export-job';
import {Query} from '../../models/query-models/query';
import {Constraint} from "../../models/constraint-models/constraint";
import {Dimension} from '../../models/table-models/dimension';
import {DataTable} from '../../models/table-models/data-table';

export class ResourceServiceMock {
  private studies: Study[];
  private pedigreeRelationTypes: object[];
  private queries: Query[];
  private treeNodes: object[];
  private exportJobs: ExportJob[];
  private dimensions: Dimension[];
  private dataTable: DataTable;

  constructor() {
    this.studies = [];
    this.pedigreeRelationTypes = [];
    this.queries = [];
    this.treeNodes = [];
    this.exportJobs = [];
    this.dimensions = [];
    this.dataTable = new DataTable();
  }

  getStudies(): Observable<Study[]> {
    return Observable.of(this.studies);
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

  getDimensions(studyNames: string[]): Observable<Dimension[]> {
    return Observable.of(this.dimensions);
  }

  getDataTable(dataTable: DataTable,
               offset: number, limit: number): Observable<DataTable> {
    return Observable.of(this.dataTable);
  }
}
