import {Observable} from 'rxjs/Observable';
import {Study} from '../../models/constraint-models/study';
import {ExportJob} from '../../models/export-models/export-job';
import {Query} from '../../models/query-models/query';
import {Constraint} from '../../models/constraint-models/constraint';
import {DataTable} from '../../models/table-models/data-table';
import {CrossTable} from '../../models/table-models/cross-table';
import {Aggregate} from '../../models/aggregate-models/aggregate';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {HttpErrorResponse} from '@angular/common/http';
import {TrialVisit} from '../../models/constraint-models/trial-visit';
import {CountItem} from '../../models/aggregate-models/count-item';
import {TransmartResourceService} from '../transmart-services/transmart-resource.service';

export class ResourceServiceMock {
  private studies: Study[];
  private pedigreeRelationTypes: object[];
  private queries: Query[];
  private treeNodes: object[];
  private exportJobs: ExportJob[];
  private dataTable: DataTable;
  private crossTable: CrossTable;
  private aggregate: Aggregate;

  constructor() {
    this.studies = [];
    this.pedigreeRelationTypes = [];
    this.queries = [];
    this.treeNodes = [];
    this.exportJobs = [];
    this.dataTable = new DataTable();
    this.crossTable = new CrossTable();
    this.aggregate = new Aggregate();
  }

  handleError(res: HttpErrorResponse) {
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

  getDataTable(dataTable: DataTable,
               offset: number, limit: number): Observable<DataTable> {
    return Observable.of(this.dataTable);
  }

  get sortableDimensions(): Set<string> {
    return TransmartResourceService.sortableDimensions;
  }

  getCrossTable(crossTable: CrossTable): Observable<CrossTable> {
    return Observable.of(this.crossTable);
  }

  getCounts(constraint: Constraint): Observable<object> {
    return Observable.of({});
  }

  getCountsPerStudyAndConcept(constraint: Constraint): Observable<Map<string, Map<string, CountItem>>> {
    let map1 = new Map<string, CountItem>();
    let item1 = new CountItem(10, 20);
    map1.set('concept1', item1);
    let map2 = new Map<string, CountItem>();
    let item2 = new CountItem(30, 110);
    let item3 = new CountItem(70, 90);
    map2.set('concept2', item2);
    map2.set('concept3', item3);
    let map = new Map<string, Map<string, CountItem>>();
    map.set('study1', map1);
    map.set('study2', map2);
    return Observable.of(map);
  }

  getCountsPerStudy(constraint: Constraint): Observable<Map<string, CountItem>> {
    let map = new Map<string, CountItem>();
    let item1 = new CountItem(10, 20);
    let item2 = new CountItem(100, 200);
    map.set('study1', item1);
    map.set('study2', item2);
    return Observable.of(map);
  }

  getCountsPerConcept(constraint: Constraint): Observable<Map<string, CountItem>> {
    let map = new Map<string, CountItem>();
    let item1 = new CountItem(10, 20);
    let item2 = new CountItem(30, 110);
    let item3 = new CountItem(70, 90);
    map.set('concept1', item1);
    map.set('concept2', item2);
    map.set('concept3', item3);
    return Observable.of(map);
  }

  getAggregate(constraint: ConceptConstraint): Observable<Aggregate> {
    return Observable.of(this.aggregate);
  }

  getTrialVisits(constraint: Constraint): Observable<TrialVisit[]> {
    return Observable.of([]);
  }

  logout() {
    return Observable.of({});
  }

  diffQuery(queryId: string): Observable<object[]> {
    return Observable.of([{}]);
  }

  deleteQuery(queryId: string): Observable<{}> {
    return Observable.of({});
  }
}
