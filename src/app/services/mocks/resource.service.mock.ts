import {Observable} from 'rxjs/Observable';
import {Study} from '../../models/constraint-models/study';
import {ExportJob} from '../../models/export-models/export-job';
import {Query} from '../../models/query-models/query';
import {Constraint} from '../../models/constraint-models/constraint';
import {Dimension} from '../../models/table-models/dimension';
import {DataTable} from '../../models/table-models/data-table';
import {CrossTable} from '../../models/table-models/cross-table';
import {Aggregate} from '../../models/aggregate-models/aggregate';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';

export class ResourceServiceMock {
  private studies: Study[];
  private pedigreeRelationTypes: object[];
  private queries: Query[];
  private treeNodes: object[];
  private exportJobs: ExportJob[];
  private dimensions: Dimension[];
  private dataTable: DataTable;
  private crossTable: CrossTable;
  private aggregate: Aggregate;

  constructor() {
    this.studies = [];
    this.pedigreeRelationTypes = [];
    this.queries = [];
    this.treeNodes = [];
    this.exportJobs = [];
    this.dimensions = [];
    this.dataTable = new DataTable();
    this.crossTable = new CrossTable();
    this.aggregate = new Aggregate();
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

  getCrossTable(crossTable: CrossTable): Observable<CrossTable> {
    return Observable.of(this.crossTable);
  }

  getCounts(constraint: Constraint): Observable<object> {
    return Observable.of({});
  }

  getAggregate(constraint: ConceptConstraint): Observable<Aggregate> {
    return Observable.of(this.aggregate);
  }

  getCountsPerStudyAndConcept(constraint: Constraint): Observable<object> {
    return Observable.of({});
  }

  logout() {
    return Observable.of({});
  }
}
