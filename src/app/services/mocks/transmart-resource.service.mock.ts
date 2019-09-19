/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {of as observableOf, Observable, AsyncSubject} from 'rxjs';
import {ExportJob} from '../../models/export-models/export-job';
import {Cohort} from '../../models/cohort-models/cohort';
import {TransmartCrossTable} from '../../models/transmart-models/transmart-cross-table';
import {Constraint} from '../../models/constraint-models/constraint';
import {TransmartTableState} from '../../models/transmart-models/transmart-table-state';
import {TransmartDataTable} from '../../models/transmart-models/transmart-data-table';
import {TransmartStudy} from '../../models/transmart-models/transmart-study';
import {SubjectSet} from '../../models/constraint-models/subject-set';
import {TransmartCountItem} from '../../models/transmart-models/transmart-count-item';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {TransmartConstraintMapper} from '../../utilities/transmart-utilities/transmart-constraint-mapper';
import {Pedigree} from '../../models/constraint-models/pedigree';
import {CohortRepresentation} from '../../models/gb-backend-models/cohort-representation';
import {Study} from '../../models/constraint-models/study';
import {DataTable} from '../../models/table-models/data-table';
import {TransmartPatient} from '../../models/transmart-models/transmart-patient';
import {ServerStatus} from '../../models/server-status';

export class TransmartResourceServiceMock {
  private _studies: Study[];
  private treeNodes: object[];
  private exportJobs: ExportJob[];

  private _autosaveSubjectSets: boolean;
  private _subjectSetConstraint: SubjectSetConstraint;
  private _cohortSelectionCounts: TransmartCountItem;

  private _status: AsyncSubject<ServerStatus> = new AsyncSubject<ServerStatus>();
  serverStatus = ServerStatus.UP;

  constructor() {
    this._studies = [];
    this.treeNodes = [];
    this.exportJobs = [];
    this.mockStudies();
  }

  private mockStudies() {
    let s1 = new Study();
    s1.dimensions = ['study', 'concept', 'patient'];
    s1.id = 'CATEGORICAL_VALUES';
    let s2 = new Study();
    s2.dimensions = ['concept', 'visit', 'patient', 'end time', 'start time', 'study'];
    s2.id = 'EHR';
    this._studies = [s1, s2];
  }

  init() {
    this._status.next(this.serverStatus);
    this._status.complete();
  }

  get status(): AsyncSubject<ServerStatus> {
    return this._status;
  }

  getStudies(): Observable<Study[]> {
    return observableOf(this._studies);
  }

  get studies(): Promise<Study[]> {
    return observableOf(this._studies).toPromise();
  }

  getPedigrees(): Observable<Pedigree[]> {
    let p1: Pedigree = new Pedigree();
    p1.description = 'Parent';
    p1.label = 'PAR';
    let p2: Pedigree = new Pedigree();
    p2.description = 'Dizyotic Twin';
    p2.label = 'DZ';
    let pedigrees: Pedigree[] = [p1, p2];
    return observableOf(pedigrees);
  }

  getTreeNodes(root: string, depth: number, hasCounts: boolean, hasTags: boolean): Observable<object> {
    return observableOf(this.treeNodes);
  }

  getExportJobs(): Observable<ExportJob[]> {
    return observableOf(this.exportJobs);
  }

  logout() {
    return observableOf({});
  }

  getStudyIds(constraint: Constraint): Observable<string[]> {
    return observableOf([]);
  }

  getPatients(constraint: Constraint): Observable<TransmartPatient[]> {
    let p = new TransmartPatient();
    p.id = 100;
    return observableOf([p]);
  }

  getDataTable(dataTable: DataTable): Observable<TransmartDataTable> {
    let dataTableResult = new TransmartDataTable();
    return observableOf(dataTableResult);
  }

  getCrossTable(baseConstraint: Constraint,
                rowConstraints: Constraint[],
                columnConstraints: Constraint[]): Observable<TransmartCrossTable> {
    let crossTableResult = new TransmartCrossTable();
    crossTableResult.rows = [[0]];
    return observableOf(crossTableResult);
  }

  getCountsPerStudyAndConcept(constraint: Constraint): Observable<object> {
    let response = {
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
    return observableOf(response);
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
    return observableOf(response);
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
    return observableOf(countsPerConcept);
  }

  getCounts(constraint: Constraint): Observable<TransmartCountItem> {
    let item = new TransmartCountItem();
    item.patientCount = 23;
    item.observationCount = 46;
    return observableOf(item);
  }

  getAggregate(constraint: Constraint): Observable<object> {
    let numAgg = {
      'CV:DEM:AGE': {
        numericalValueAggregates: {
          avg: 23.33,
          count: 3,
          max: 26,
          min: 20
        }
      }
    };
    return observableOf(numAgg);
  }

  getExportFileFormats(): Observable<string[]> {
    return observableOf(['tsv', 'csv']);
  }

  getExportDataFormats(constraint: Constraint): Observable<string[]> {
    return observableOf([]);
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

  get cohortSelectionCounts(): TransmartCountItem {
    return this._cohortSelectionCounts;
  }

  set cohortSelectionCounts(value: TransmartCountItem) {
    this._cohortSelectionCounts = value;
  }

  updateCohortSelectionCounts(constraint: Constraint): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.cohortSelectionCounts = new TransmartCountItem();
      this.cohortSelectionCounts.patientCount = 10;
      this.cohortSelectionCounts.observationCount = 100;
      resolve(true);
    });
  }
}
