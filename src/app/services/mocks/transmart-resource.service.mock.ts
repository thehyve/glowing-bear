/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {of as observableOf, Observable} from 'rxjs';
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
import {TransmartQuery} from '../../models/transmart-models/transmart-query';
import {Study} from '../../models/constraint-models/study';
import {DataTable} from '../../models/table-models/data-table';

export class TransmartResourceServiceMock {
  private _studies: Study[];
  private treeNodes: object[];
  private exportJobs: ExportJob[];

  private _autosaveSubjectSets: boolean;
  private _subjectSetConstraint: SubjectSetConstraint;
  private _inclusionCounts: TransmartCountItem;
  private _exclusionCounts: TransmartCountItem;

  constructor() {
    this._studies = [];
    this.treeNodes = [];
    this.exportJobs = [];
    this.mockStudies();
  }

  private mockStudies() {
    let s1 = new Study();
    s1.dimensions = ['study', 'cocnept', 'patient'];
    s1.id = 'CATEGORICAL_VALUES';
    let s2 = new Study();
    s2.dimensions = ['concept', 'visit', 'patient', 'end time', 'start time', 'study'];
    s2.id = 'EHR';
    this._studies = [s1, s2];
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

  getQueries(): Observable<TransmartQuery[]> {
    let q1: TransmartQuery = new TransmartQuery('dt');
    q1.bookmarked = false;
    q1.createDate = '2018-07-03T13:18:31Z';
    q1.subscribed = false;
    q1.subscriptionFreq = null;
    q1.updateDate = '2018-07-03T13:18:31Z';
    q1.observationsQuery = {
      data: ['\\Public Studies\\CATEGORICAL_VALUES\\Demography\\Race\\']
    };
    q1.patientsQuery = {type: 'true'};
    q1.queryBlob = {
      dataTableState: {
        columnDimensions: ['study'],
        columnSort: [],
        rowDimensions: ['patient', 'concept'],
        rowSort: []
      }
    };
    q1.queryBlob = {
      patientsQueryFull: q1.patientsQuery
    };
    let q2: TransmartQuery = new TransmartQuery('test');
    q2.bookmarked = false;
    q2.createDate = '2018-07-04T10:08:33Z';
    q2.subscribed = false;
    q2.subscriptionFreq = null;
    q2.updateDate = '2018-07-04T10:08:33Z';
    q2.observationsQuery = {
      data: [
        '\\Public Studies\\Oracle_1000_Patient\\Demographics\\Age\\',
        '\\Public Studies\\Oracle_1000_Patient\\Demographics\\Gender\\',
        '\\Public Studies\\Oracle_1000_Patient\\Demographics\\']
    };
    q2.patientsQuery = {
      type: 'and',
      args: [
        {
          constraint: {
            type: 'or',
            args: [
              {
                type: 'subselection',
                dimension: 'patient',
                constraint: {
                  type: 'and',
                  args: [
                    {
                      conceptCode: 'SCSCP:DEM:AGE',
                      conceptPath: '\\Private Studies\\SHARED_CONCEPTS_STUDY_C_PRIV\\Demography\\Age\\',
                      fullName: '\\Private Studies\\SHARED_CONCEPTS_STUDY_C_PRIV\\Demography\\Age\\',
                      name: 'Age',
                      type: 'concept',
                      valueType: 'NUMERIC'
                    },
                    {
                      operator: '<=',
                      type: 'value',
                      value: 35,
                      valueType: 'NUMERIC'
                    }
                  ]
                }
              },
              {
                type: 'subselection',
                dimension: 'patient',
                constraint: {
                  type: 'and',
                  args: [
                    {
                      conceptCode: 'O1KP:CAT8',
                      conceptPath: '\\Public Studies\\Oracle_1000_Patient\\Categorical_locations\\categorical_8\\',
                      fullName: '\\Public Studies\\Oracle_1000_Patient\\Categorical_locations\\categorical_8\\',
                      name: 'categorical_8',
                      type: 'concept',
                      valueType: 'CATEGORICAL'
                    },
                    {
                      type: 'or',
                      args: [
                        {
                          operator: '=',
                          type: 'value',
                          value: 'Heart',
                          valueType: 'STRING'
                        },
                        {
                          operator: '=',
                          type: 'value',
                          value: 'Liver',
                          valueType: 'STRING'
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          },
          dimension: 'patient',
          type: 'subselection'
        },
        {
          arg: {
            type: 'subselection',
            dimension: 'patient',
            constraint: {
              conceptCode: 'VSIGN:HR',
              conceptPath: '\\Vital Signs\\Heart Rate\\',
              fullName: '\\Private Studies\\SHARED_CONCEPTS_STUDY_C_PRIV\\Vital Signs\\Heart Rate\\',
              name: 'Heart Rate',
              type: 'concept',
              valueType: 'NUMERIC'
            }
          },
          type: 'negation'
        }
      ]
    };
    q2.queryBlob = {
      dataTableState: {
        columnDimensions: [],
        columnSort: [],
        rowDimensions: ['patient', 'study', 'concept'],
        rowSort: []
      },
      patientsQueryFull: q2.patientsQuery
    };
    let queries: TransmartQuery[] = [q1, q2];
    return observableOf(queries);
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
      resolve(true);
    });
  }
}
