/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {of as observableOf, Observable} from 'rxjs';
import {Study} from '../../models/constraint-models/study';
import {ExportJob} from '../../models/export-models/export-job';
import {Cohort} from '../../models/cohort-models/cohort';
import {Constraint} from '../../models/constraint-models/constraint';
import {DataTable} from '../../models/table-models/data-table';
import {CrossTable} from '../../models/table-models/cross-table';
import {Aggregate} from '../../models/aggregate-models/aggregate';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {TrialVisit} from '../../models/constraint-models/trial-visit';
import {CountItem} from '../../models/aggregate-models/count-item';
import {TransmartHttpService} from '../http/transmart-http.service';
import {ExportDataType} from '../../models/export-models/export-data-type';
import {CategoricalAggregate} from '../../models/aggregate-models/categorical-aggregate';
import {TransmartPatient} from '../../models/transmart-models/transmart-patient';

export class ResourceServiceMock {
  private studies: Study[];
  private queries: Cohort[];
  private treeNodes: object[];
  private exportJobs: ExportJob[];
  private dataTable: DataTable;
  private crossTable: CrossTable;
  private aggregate: Aggregate;

  inclusionCounts: CountItem;
  exclusionCounts: CountItem;

  constructor() {
    this.studies = [];
    this.queries = [];
    this.treeNodes = [];
    this.exportJobs = [];
    this.dataTable = new DataTable();
    this.crossTable = new CrossTable();
    this.aggregate = new Aggregate();
  }

  updateInclusionExclusionCounts(constraint: Constraint,
                                 inclusionConstraint: Constraint,
                                 exclusionConstraint?: Constraint): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.inclusionCounts = new CountItem(200, 1000);
      this.exclusionCounts = new CountItem(30, 200);
      resolve(true);
    });
  }

  getStudies(): Observable<Study[]> {
    return observableOf(this.studies);
  }

  getPedigrees(): Observable<object[]> {
    return observableOf([]);
  }

  getCohorts(): Observable<Cohort[]> {
    return observableOf(this.queries);
  }

  getSubjects(constraint: Constraint): Observable<TransmartPatient[]> {
    let p1 = new TransmartPatient();
    p1.id = 1;
    p1.inTrialId = 'in1';
    p1.subjectIds = { SUBJ_ID: 'one' };
    let p2 = new TransmartPatient();
    p2.id = 2;
    p2.inTrialId = 'in2';
    p2.subjectIds = { SUBJ_ID: 'two' };
    let p3 = new TransmartPatient();
    p3.id = 3;
    p3.inTrialId = 'in3';
    p3.subjectIds = { SUBJ_ID: 'three' };
    return observableOf([p1, p2, p3]);
  }

  getTreeNodes(root: string, depth: number, hasCounts: boolean, hasTags: boolean): Observable<object> {
    return observableOf(this.treeNodes);
  }

  getExportJobs(): Observable<ExportJob[]> {
    let newExportJob = new ExportJob();
    newExportJob.id = 'id';
    newExportJob.name = 'test job name';
    this.exportJobs = [newExportJob];
    return observableOf(this.exportJobs);
  }

  getDataTable(dataTable: DataTable): Observable<DataTable> {
    return observableOf(this.dataTable);
  }

  get sortableDimensions(): Set<string> {
    return TransmartHttpService.sortableDimensions;
  }

  getCrossTable(crossTable: CrossTable): Observable<CrossTable> {
    return observableOf(this.crossTable);
  }

  getCounts(constraint: Constraint): Observable<object> {
    return observableOf({});
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
    return observableOf(map);
  }

  getCountsPerStudy(constraint: Constraint): Observable<Map<string, CountItem>> {
    let map = new Map<string, CountItem>();
    let item1 = new CountItem(10, 20);
    let item2 = new CountItem(100, 200);
    map.set('study1', item1);
    map.set('study2', item2);
    return observableOf(map);
  }

  getCountsPerConcept(constraint: Constraint): Observable<Map<string, CountItem>> {
    let map = new Map<string, CountItem>();
    let item1 = new CountItem(10, 20);
    let item2 = new CountItem(30, 110);
    let item3 = new CountItem(70, 90);
    map.set('concept1', item1);
    map.set('concept2', item2);
    map.set('concept3', item3);
    return observableOf(map);
  }

  getAggregate(constraint: ConceptConstraint): Observable<Aggregate> {
    return observableOf(this.aggregate);
  }

  getCategoricalAggregate(constraint: ConceptConstraint): Observable<CategoricalAggregate> {
    let agg: CategoricalAggregate = new CategoricalAggregate();
    return observableOf(agg);
  }

  getTrialVisits(constraint: Constraint): Observable<TrialVisit[]> {
    return observableOf([]);
  }

  logout() {
    return observableOf({});
  }

  diffCohort(id: string): Observable<object[]> {
    return observableOf([{}]);
  }

  deleteCohort(id: string): Observable<{}> {
    return observableOf({});
  }

  getExportDataTypes(constraint: Constraint): Observable<ExportDataType[]> {
    return observableOf([]);
  }

  saveCohort(target: Cohort): Observable<Cohort> {
    return observableOf(new Cohort('id', 'name'));
  }

  createExportJob(name: string): Observable<ExportJob> {
    let newExportJob = new ExportJob();
    newExportJob.id = 'id';
    newExportJob.name = 'test job name';
    return observableOf(newExportJob);
  }

  runExportJob(job: ExportJob,
               dataTypes: ExportDataType[],
               constraint: Constraint,
               dataTable: DataTable): Observable<ExportJob> {
    let newExportJob = new ExportJob();
    newExportJob.id = 'id';
    newExportJob.name = 'test job name';
    return observableOf(newExportJob);
  }

  downloadExportJob(jobId: string): Observable<Blob> {
    return Observable.of(new Blob());
  }

  cancelExportJob(jobId: string): Observable<{}> {
    return Observable.of({});
  }

  archiveExportJob(jobId: string): Observable<{}> {
    return Observable.of({});
  }
}
