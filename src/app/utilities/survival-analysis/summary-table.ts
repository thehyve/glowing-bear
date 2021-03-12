/**
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { SurvivalPoint } from '../../models/survival-analysis/survival-point';


export function summaryTable(points: Array<SurvivalPoint>, milestones: Array<number>): Array<{ atRisk: number, event: number }> {
  let pointIndex = 0
  const nofPoints = points.length

  let cumulAtRisk = points[0].atRisk
  let cumulEvent = 0
  let res = new Array<{ atRisk: number, event: number }>()

  milestones.forEach(milestone => {

    while ((nofPoints > pointIndex) && (points[pointIndex].timePoint <= milestone)) {
      cumulAtRisk = points[pointIndex].atRisk
      cumulEvent = points[pointIndex].cumulEvents
      pointIndex++
    }

    res.push({ atRisk: cumulAtRisk, event: cumulEvent })

  })
  return res
}
