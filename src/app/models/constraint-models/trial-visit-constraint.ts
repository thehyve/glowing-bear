/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Constraint} from './constraint';
import {TrialVisit} from './trial-visit';

export class TrialVisitConstraint extends Constraint {

  private _trialVisits: TrialVisit[];


  constructor() {
    super();
    this.trialVisits = [];
    this.textRepresentation = 'Trial visit constraint';
  }

  get className(): string {
    return 'TrialVisitConstraint';
  }

  get trialVisits(): TrialVisit[] {
    return this._trialVisits;
  }

  set trialVisits(value: TrialVisit[]) {
    this._trialVisits = value;
  }
}
