/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Constraint} from './constraint';

export class NegationConstraint extends Constraint {

  private _constraint: Constraint;

  constructor(constraint: Constraint) {
    super();
    this.constraint = constraint;
    this.textRepresentation = 'Negation';
  }

  get constraint(): Constraint {
    return this._constraint;
  }

  set constraint(value: Constraint) {
    this._constraint = value;
  }

  get className(): string {
    return 'NegationConstraint';
  }
}
