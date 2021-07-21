/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Constraint } from './constraint';
import { Cohort } from './../../models/cohort-models/cohort';
import { FormatHelper } from '../../utilities/format-helper';

export class CohortConstraint extends Constraint {
  private _cohort: Cohort;
  
  constructor() {
    super();
    this.textRepresentation = 'Cohort';
  }

  get className(): string {
    return 'CohortConstraint';
  }

  get cohort(): Cohort {
    return this._cohort;
  }

  set cohort(cohort: Cohort) {
    this._cohort = cohort;
    this.textRepresentation = cohort ? `Cohort: ${cohort.name}` : FormatHelper.nullValuePlaceholder;
  }
}
