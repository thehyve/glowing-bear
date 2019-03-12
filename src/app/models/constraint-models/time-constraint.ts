/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Constraint} from './constraint';
import {DateOperatorState} from './date-operator-state';

export class TimeConstraint extends Constraint {

  dateOperator: DateOperatorState = DateOperatorState.BETWEEN;
  date1: Date = new Date();
  date2: Date = new Date();

  // the flag indicating if the constraint is related to observation date
  private _isObservationDate = false;

  constructor() {
    super();
    this.textRepresentation = 'Time constraint';
  }

  get className(): string {
    return 'TimeConstraint';
  }

  get isObservationDate(): boolean {
    return this._isObservationDate;
  }

  set isObservationDate(value: boolean) {
    this._isObservationDate = value;
  }
}
