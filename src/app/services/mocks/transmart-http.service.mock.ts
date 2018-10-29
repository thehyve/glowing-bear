/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {of as observableOf, Observable} from 'rxjs';
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
import {TransmartConstraintMapper} from '../../utilities/transmart-utilities/transmart-constraint-mapper';
import {Pedigree} from '../../models/constraint-models/pedigree';
import {TransmartQuery} from '../../models/transmart-models/transmart-query';

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
    s1.dimensions = ['study', 'cocnept', 'patient'];
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

  getExportFileFormats(): Observable<string[]> {
    return observableOf(['tsv', 'csv']);
  }

  getExportDataFormats(constraint: Constraint): Observable<string[]> {
    return observableOf([]);
  }

  runExportJob(): Observable<ExportJob[]> {
    return observableOf(
      new ExportJob();
    );
  }

}
