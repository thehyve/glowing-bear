/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Observable} from 'rxjs/Observable';
import {ExportJob} from '../../models/export-models/export-job';
import {Query} from '../../models/query-models/query';
import {TransmartCrossTable} from '../../models/transmart-models/transmart-cross-table';
import {Constraint} from '../../models/constraint-models/constraint';
import {TransmartTableState} from '../../models/transmart-models/transmart-table-state';
import {TransmartDataTable} from '../../models/transmart-models/transmart-data-table';
import {TransmartStudy} from '../../models/transmart-models/transmart-study';
import {SubjectSet} from '../../models/constraint-models/subject-set';
import {TransmartCountItem} from '../../models/transmart-models/transmart-count-item';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';

export class TransmartResourceServiceMock {
  private _studies: TransmartStudy[];
  private pedigreeRelationTypes: object[];
  private queries: Query[];
  private treeNodes: object[];
  private exportJobs: ExportJob[];

  private _autosaveSubjectSets: boolean;
  private _subjectSetConstraint: SubjectSetConstraint;
  private _inclusionCounts: TransmartCountItem;
  private _exclusionCounts: TransmartCountItem;
  private _studyConceptCountObject: object;

  constructor() {
    this._studies = [];
    this.pedigreeRelationTypes = [];
    this.queries = [];
    this.treeNodes = [];
    this.exportJobs = [];
    this.mockStudies();
  }

  private mockStudies() {
    let s1 = new TransmartStudy();
    s1.dimensions = ['study', 'cocnept', 'patient'];
    s1.studyId = 'CATEGORICAL_VALUES';
    let s2 = new TransmartStudy();
    s2.dimensions = ['concept', 'visit', 'patient', 'end time', 'start time', 'study']
    s2.studyId = 'EHR';
    this._studies = [s1, s2];
  }

  getStudies(): Observable<TransmartStudy[]> {
    return Observable.of(this._studies);
  }

  get studies(): Promise<TransmartStudy[]> {
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
    let response =  {
      'EHR': {
        'EHR:DEM:AGE': {
          patientCount: 4,
          observationCount: 30
        },
        'EHR:VSIGN:HR': {
          patientCount: 6,
          observationCount: 70
        }
      }
    }
    return Observable.of(response);
  }

  getCountsPerStudy(constraint: Constraint): Observable<object> {
    let response = {
      'CATEGORICAL_VALUES': {
        patientCount: 20,
        observationCount: 200
      },
      'EHR': {
        patientCount: 10,
        observationCount: 100
      }
    };
    return Observable.of(response);
  }

  getCountsPerConcept(constraint: Constraint): Observable<object> {
    let countsPerConcept = {
      'EHR:DEM:AGE': {
        patientCount: 4,
        observationCount: 30
      },
      'EHR:VSIGN:HR': {
        patientCount: 6,
        observationCount: 70
      }
    }
    return Observable.of(countsPerConcept);
  }

  getCounts(constraint: Constraint): Observable<TransmartCountItem> {
    let item = new TransmartCountItem();
    item.patientCount = 23;
    item.observationCount = 46;
    return Observable.of(item);
  }

  getExportFileFormats(): Observable<string[]> {
    return Observable.of(['tsv', 'csv']);
  }

  getExportDataFormats(constraint: Constraint): Observable<string[]> {
    return Observable.of([]);
  }

  get autosaveSubjectSets(): boolean {
    return this._autosaveSubjectSets;
  }

  set autosaveSubjectSets(value: boolean) {
    this._autosaveSubjectSets = value;
  }

  get subjectSetConstraint(): SubjectSetConstraint {
    return this._subjectSetConstraint;
  }

  set subjectSetConstraint(value: SubjectSetConstraint) {
    this._subjectSetConstraint = value;
  }

  get inclusionCounts(): TransmartCountItem {
    return this._inclusionCounts;
  }

  set inclusionCounts(value: TransmartCountItem) {
    this._inclusionCounts = value;
  }

  get exclusionCounts(): TransmartCountItem {
    return this._exclusionCounts;
  }

  set exclusionCounts(value: TransmartCountItem) {
    this._exclusionCounts = value;
  }

  get studyConceptCountObject(): object {
    return this._studyConceptCountObject;
  }

  set studyConceptCountObject(value: object) {
    this._studyConceptCountObject = value;
  }

  updateInclusionExclusionCounts(constraint: Constraint,
                                 inclusionConstraint: Constraint,
                                 exclusionConstraint?: Constraint): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.inclusionCounts = new TransmartCountItem();
      this.inclusionCounts.patientCount = 10;
      this.inclusionCounts.observationCount = 100;
      this.exclusionCounts = new TransmartCountItem();
      this.exclusionCounts.patientCount = 0;
      this.exclusionCounts.observationCount = 0;
      this.studyConceptCountObject = {
        EHR: {
          'EHR:DEM:AGE': {
            patientCount: 4,
            observationCount: 30
          },
          'EHR:VSIGN:HR': {
            patientCount: 6,
            observationCount: 70
          }
        }
      }
      resolve(true);
    });
  }
}
