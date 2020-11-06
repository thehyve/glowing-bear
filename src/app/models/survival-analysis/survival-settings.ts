/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Granularity } from './granularity-type';

export class SurvivalSettings {
  constructor(
    public timeGranularity: Granularity,
    public timeLimit: number,
    public startEvent: string,
    public startModifier: string,
    public endEvent: string,
    public endModifier: string,
    public subGroupTextRepresentations: {
      groupId: string,
      rootInclusionConstraint?: string,
      rootExclusionConstraint?: string
    }[]
  ) { }

}
