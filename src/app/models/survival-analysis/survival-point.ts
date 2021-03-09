/**
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 *
 * A description of functions related to survival analysis can be found at
 *
 * KAPLAN, Edward L., et MEIER, Paul. Nonparametric estimation from incomplete observations.
 * Journal of the American statistical association, 1958, 53.282 : 457-481.
 *
 *
 */

export class SurvivalPoint {

  constructor(
    public readonly prob: number,
    // cumul is used for computing variance estimate
    public readonly cumul: number,
    public readonly remaining: number,
    public readonly timePoint: number,
    public readonly cumulEvents: number,
    public readonly cumulCensoringEvents: number,
    public readonly eventOfInterest: number,
    public readonly censoringEvent: number) {

  }

  get atRisk(): number {
    return this.remaining + this.censoringEvent + this.eventOfInterest
  }
}
