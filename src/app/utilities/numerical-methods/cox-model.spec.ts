/**
 * Copyright 2020  CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SurvivalAnalysisClear } from 'app/models/survival-analysis/survival-analysis-clear'
import { clearResultsToArray } from 'app/models/survival-analysis/survival-curves'
import { NewCoxRegression } from './cox-model'

describe('Cox regression test', () => {

  // preliminary objects
  const precision = 5
  let survivalAnalysisClear1 = new SurvivalAnalysisClear()
  survivalAnalysisClear1.results = [
    {
      groupId: 'group1',
      initialCount: 6,
      groupResults: [
        {
          events: {
            eventOfInterest: 2,
            censoringEvent: 2,
          },
          timepoint: 1
        },
        {
          events: {
            eventOfInterest: 1,
            censoringEvent: 1,
          },
          timepoint: 3
        }
      ]
    },
    {
      groupId: 'group2',
      initialCount: 2,
      groupResults: [
        {
          events: {
            eventOfInterest: 1,
            censoringEvent: 1,
          },
          timepoint: 2
        }
      ]
    }]

  let survivalAnalysisClear2 = new SurvivalAnalysisClear()
  survivalAnalysisClear2.results = [
    {
      groupId: 'group1',
      initialCount: 2,
      groupResults: [
        {
          events: {
            eventOfInterest: 1,
            censoringEvent: 0,
          },
          timepoint: 1
        },
        {
          events: {
            eventOfInterest: 1,
            censoringEvent: 0,
          },
          timepoint: 3
        }
      ]
    },
    {
      groupId: 'group2',
      initialCount: 1,
      groupResults: [
        {
          events: {
            eventOfInterest: 1,
            censoringEvent: 0,
          },
          timepoint: 2
        }
      ]
    }]

  // crafting argument
  let coxInput1 = clearResultsToArray(survivalAnalysisClear1)
  let coxInput2 = clearResultsToArray(survivalAnalysisClear2)

  // check the behaviours that should throw an error
  it('unknown provided method', () => {
    expect(() => {
      NewCoxRegression([coxInput1.curves[0].points, coxInput1.curves[1].points], 1000, 1e-14, 'this for sure is not a method')
    }).toThrowError()
  })
  it('wrong number of max iteration', () => {
    expect(() => {
      NewCoxRegression([coxInput1.curves[0].points, coxInput1.curves[1].points], -10, 1e-14, 'BRESLOW')
    }).toThrowError()
    expect(() => {
      NewCoxRegression([coxInput1.curves[0].points, coxInput1.curves[1].points], 0, 1e-14, 'BRESLOW')
    }).toThrowError()
  })
  it('wrong tolerance', () => {
    expect(() => {
      NewCoxRegression([coxInput1.curves[0].points, coxInput1.curves[1].points], 1000, 0, 'BRESLOW')
    }).toThrowError()
    expect(() => {
      NewCoxRegression([coxInput1.curves[0].points, coxInput1.curves[1].points], 1000, -1e-14, 'BRESLOW')
    }).toThrowError()
  })
  it('wrong number of groups', () => {
    expect(() => {
      NewCoxRegression([coxInput1.curves[0].points], 1000, 1e-14, 'BRESLOW')
    }).toThrowError()
    expect(() => {
      NewCoxRegression([], 1000, 1e-14, 'BRESLOW')
    }).toThrowError()
    expect(() => {
      NewCoxRegression([coxInput1.curves[0].points, coxInput1.curves[1].points, coxInput1.curves[1].points], 1000, 1e-14, 'BRESLOW')
    })
  })

  // check Breslow's method with tied events
  it(`Breslow's method`, () => {
    let breslow = NewCoxRegression([coxInput1.curves[0].points, coxInput1.curves[1].points], 1000, 1e-14, 'BRESLOW')
    expect(breslow.run().finalBeta[0]).toBeCloseTo(0.0, precision)
  })

  // check Efron's method with tied events
  it(`Efron's method`, () => {
    let breslow = NewCoxRegression([coxInput1.curves[0].points, coxInput1.curves[1].points], 1000, 1e-14, 'EFRON')
    expect(breslow.run().finalBeta[0]).toBeCloseTo(-0.05612, precision)
  })

  // check Breslow's and Efron's methods equivalence, when no more than one event (cenosring or not)
  // occurs, those methods are supposedly equivalent

  it(`Breslow's and Efron's methods equivalence`, () => {
    let breslow = NewCoxRegression([coxInput2.curves[0].points, coxInput2.curves[1].points], 1000, 1e-14, 'BRESLOW')
    let efron = NewCoxRegression([coxInput2.curves[0].points, coxInput2.curves[1].points], 1000, 1e-14, 'EFRON')
    let breslowRes = breslow.run().finalBeta[0]
    expect(breslowRes).toBeCloseTo(0.34657, precision)
    expect(breslowRes).toBeCloseTo(efron.run().finalBeta[0], precision)
  })

})
