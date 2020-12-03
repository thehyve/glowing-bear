/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ApiI2b2Panel } from '../medco-node/api-i2b2-panel'

export class ApiSurvivalAnalysis {
  ID: string
  cohortName: string
  subGroupDefinitions: Array<{ groupName: string, panels: Array<ApiI2b2Panel> }>
  timeLimit: number
  timeGranularity: string
  startConcept: string
  endConcept: string
  startModifier: string
  endModifier: string
  userPublicKey: string

}
