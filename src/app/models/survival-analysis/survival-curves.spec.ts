/**
 * Copyright 2020  CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { deepEqual } from 'assert'
import { SurvivalAnalysisClear } from './survival-analysis-clear'
import { clearResultsToArray } from './survival-curves'
import { SurvivalPoint } from './survival-point'


describe('Test formatting API result point and variable precomputing', () => {

  // crafting the argument
  let survivalAnalysisClear = new SurvivalAnalysisClear()
  survivalAnalysisClear.results = [
    {
      groupId: 'group1',
      initialCount: 100,
      groupResults: [
        {
          events: {
            eventOfInterest: 2,
            censoringEvent: 3,
          },
          timepoint: 1
        },
        {
          events: {
            eventOfInterest: 0,
            censoringEvent: 5,
          },
          timepoint: 4
        },
        {
          events: {
            eventOfInterest: 6,
            censoringEvent: 7,
          },
          timepoint: 6
        }
      ]
    },
    {
      groupId: 'group2',
      initialCount: 20,
      groupResults: [{
        events: {
          eventOfInterest: 1,
          censoringEvent: 0,

        },
        timepoint: 1
      }]
    },
    {
      groupId: 'group3',
      initialCount: 30,
      groupResults: [{
        events: {
          eventOfInterest: 0,
          censoringEvent: 1,

        },
        timepoint: 1
      }]
    }
  ]

  let result = clearResultsToArray(survivalAnalysisClear)



  // expected results from curve 1
  let expectedRes1 = new Array<SurvivalPoint>(3)
  expectedRes1[0] = new SurvivalPoint()
  expectedRes1[0].atRisk = 100
  expectedRes1[0].cumul = 2 / (100 * 98)
  expectedRes1[0].timePoint = 1
  expectedRes1[0].cumulEvents = 2
  expectedRes1[0].cumulCensorings = 3
  expectedRes1[0].prob = 1 - 2 / 100
  expectedRes1[0].remaining = 95
  expectedRes1[0].nofEvents = 2
  expectedRes1[0].nofCensorings = 3

  expectedRes1[1] = new SurvivalPoint()
  expectedRes1[1].atRisk = 95
  expectedRes1[1].cumul = 2 / (100 * 98) + 0
  expectedRes1[1].timePoint = 4
  expectedRes1[1].cumulEvents = 2
  expectedRes1[1].cumulCensorings = 8
  expectedRes1[1].prob = (1 - 2 / 100) * 1
  expectedRes1[1].remaining = 90
  expectedRes1[1].nofEvents = 0
  expectedRes1[1].nofCensorings = 5

  expectedRes1[2] = new SurvivalPoint()
  expectedRes1[2].atRisk = 90
  expectedRes1[2].cumul = 2 / (100 * 98) + 0 + 6 / (90 * 84)
  expectedRes1[2].timePoint = 6
  expectedRes1[2].cumulEvents = 8
  expectedRes1[2].cumulCensorings = 15
  expectedRes1[2].prob = (1 - 2 / 100) * 1 * (1 - 6 / 90)
  expectedRes1[2].remaining = 77
  expectedRes1[2].nofEvents = 6
  expectedRes1[2].nofCensorings = 7

  // expected result from curve 2
  let expectedRes2 = Array<SurvivalPoint>(1)
  expectedRes2[0] = new SurvivalPoint()
  expectedRes2[0].atRisk = 20
  expectedRes2[0].cumul = 1 / (20 * 19)
  expectedRes2[0].timePoint = 1
  expectedRes2[0].cumulEvents = 1
  expectedRes2[0].cumulCensorings = 0
  expectedRes2[0].prob = 1 - 1 / 20
  expectedRes2[0].remaining = 19
  expectedRes2[0].nofEvents = 1
  expectedRes2[0].nofCensorings = 0

  // expected result from curve 2
  let expectedRes3 = Array<SurvivalPoint>(1)
  expectedRes3[0] = new SurvivalPoint()
  expectedRes3[0].atRisk = 30
  expectedRes3[0].cumul = 0
  expectedRes3[0].timePoint = 1
  expectedRes3[0].cumulEvents = 0
  expectedRes3[0].cumulCensorings = 1
  expectedRes3[0].prob = 1
  expectedRes3[0].remaining = 29
  expectedRes3[0].nofEvents = 0
  expectedRes3[0].nofCensorings = 1

  // check
  it('the number of sub groups should be the same in arguments and results', () => {
    expect(result.curves.length === 3).toBeTrue();
  })

  it('the group names should be the same in arguments and results', () => {
    expect(result.curves[0].groupId === 'group1').toBeTrue();
    expect(result.curves[1].groupId === 'group2').toBeTrue();
    expect(result.curves[2].groupId === 'group3').toBeTrue();
  })

  it('check the computed values by clearResultsToArray', () => {

    expect(() => { deepEqual(result.curves[0].points, expectedRes1) }).not.toThrowError()
    expect(() => { deepEqual(result.curves[1].points, expectedRes2) }).not.toThrowError()
    expect(() => { deepEqual(result.curves[2].points, expectedRes3) }).not.toThrowError()

  })
})
