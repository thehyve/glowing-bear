/**
 * Copyright 2019 The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Observable, of as observableOf} from 'rxjs';
import {GbBackendQuery} from '../../models/gb-backend-models/gb-backend-query';

export class GbBackendHttpServiceMock {

  constructor() {
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
      queryConstraintFull: q1.queryConstraint
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
      queryConstraintFull: q2.queryConstraint
    };
    let queries: GbBackendQuery[] = [q1, q2];
    return observableOf(queries);
  }

}
