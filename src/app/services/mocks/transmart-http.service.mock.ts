/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Observable, of as observableOf} from 'rxjs';
import {ExportJob} from '../../models/export-models/export-job';
import {Constraint} from '../../models/constraint-models/constraint';
import {TransmartStudy} from '../../models/transmart-models/transmart-study';
import {Pedigree} from '../../models/constraint-models/pedigree';
import {GbBackendQuery} from '../../models/gb-backend-models/gb-backend-query';
import {TransmartExportElement} from '../../models/transmart-models/transmart-export-element';
import {TransmartTableState} from '../../models/transmart-models/transmart-table-state';
import {TransmartDataTable} from '../../models/transmart-models/transmart-data-table';
import {TransmartCrossTable} from '../../models/transmart-models/transmart-cross-table';
import {SubjectSet} from '../../models/constraint-models/subject-set';
import {TransmartCountItem} from '../../models/transmart-models/transmart-count-item';
import {TransmartConstraintMapper} from '../../utilities/transmart-utilities/transmart-constraint-mapper';

export class TransmartHttpServiceMock {
  private _studies: TransmartStudy[];
  private treeNodes: object[];
  private exportJobs: ExportJob[];

  private _studyConceptCountObject: object;

  constructor() {
    this._studies = [];
    this.treeNodes = [];
    this.exportJobs = [];
    this.mockStudies();
  }

  private mockStudies() {
    let s1 = new TransmartStudy();
    s1.dimensions = ['study', 'concept', 'patient'];
    s1.studyId = 'CATEGORICAL_VALUES';
    let s2 = new TransmartStudy();
    s2.dimensions = ['concept', 'visit', 'patient', 'end time', 'start time', 'study'];
    s2.studyId = 'EHR';
    this._studies = [s1, s2];
  }

  getStudies(): Observable<TransmartStudy[]> {
    return observableOf(this._studies);
  }

  get studies(): Promise<TransmartStudy[]> {
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

  getQueries(): Observable<GbBackendQuery[]> {
    let q1: GbBackendQuery = new GbBackendQuery('dt');
    q1.bookmarked = false;
    q1.createDate = '2018-07-03T13:18:31Z';
    q1.subscribed = false;
    q1.subscriptionFreq = null;
    q1.updateDate = '2018-07-03T13:18:31Z';
    q1.queryConstraint = {type: 'true'};
    q1.queryBlob = {
      dataTableState: {
        columnDimensions: ['study'],
        columnSort: [],
        rowDimensions: ['patient', 'concept'],
        rowSort: []
      }
    };
    q1.queryBlob = {
      patientsQueryFull: q1.queryConstraint
    };
    let q2: GbBackendQuery = new GbBackendQuery('test');
    q2.bookmarked = false;
    q2.createDate = '2018-07-04T10:08:33Z';
    q2.subscribed = false;
    q2.subscriptionFreq = null;
    q2.updateDate = '2018-07-04T10:08:33Z';
    q2.queryConstraint = {
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
      patientsQueryFull: q2.queryConstraint
    };
    let queries: GbBackendQuery[] = [q1, q2];
    return observableOf(queries);
  }

  getTreeNodes(root: string, depth: number, hasCounts: boolean, hasTags: boolean): Observable<object> {
    return observableOf(this.treeNodes);
  }

  getExportJobs(): Observable<ExportJob[]> {
    return observableOf(this.exportJobs);
  }

  getExportFileFormats(): Observable<string[]> {
    return observableOf(['tsv', 'csv']);
  }

  getExportDataFormats(constraint: Constraint): Observable<string[]> {
    return observableOf([]);
  }

  runExportJob(jobId: string,
               targetConstraint: Constraint,
               elements: TransmartExportElement[],
               tableState?: TransmartTableState): Observable<ExportJob> {
    return observableOf(null);
  }

  runSurveyTableExportJob(jobId: string,
                          targetConstraint: Constraint,
                          elements: TransmartExportElement[],
                          dateColumnsIncluded: boolean) {
    return observableOf(null);
  }

  getStudyIds(constraint: Constraint): Observable<string[]> {
    return observableOf([]);
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

  savePatientSet(name: string, constraint: Constraint): Observable<SubjectSet> {
    const result = new SubjectSet();
    result.description = name;
    result.id = 2345;
    result.setSize = 100;
    return Observable.of(result);
  }

  getCountsPerStudyAndConcept(constraint: Constraint): Observable<object> {
    return Observable.of({
      STUDY1: {
        Foo: {
          patientCount: 40,
          observationCount: 400
        },
        Bar: {
          patientCount: 30,
          observationCount: 300
        }
      }
    })
  }

  getCountsPerStudy(constraint: Constraint): Observable<object> {
    return Observable.of({
      STUDY1: {
        patientCount: 50,
        observationCount: 700
      }
    })
  }

  getCountsPerConcept(constraint: Constraint): Observable<object> {
    return Observable.of({
      Foo: {
        patientCount: 40,
        observationCount: 400
      },
      Bar: {
        patientCount: 30,
        observationCount: 300
      }
    })
  }

  getCounts(constraint: Constraint): Observable<TransmartCountItem> {
    const result = new TransmartCountItem();
    result.patientCount = 100;
    result.observationCount = 1000;
    return Observable.of(result);
  }

}
