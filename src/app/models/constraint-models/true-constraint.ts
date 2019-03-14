/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Constraint} from './constraint';

export class TrueConstraint extends Constraint {

  constructor() {
    super();
    this.textRepresentation = 'True';
  }

  get className(): string {
    return 'TrueConstraint';
  }

  clone(): TrueConstraint {
    const clone = new TrueConstraint();
    clone.negated = this.negated;
    return clone;
  }

}
