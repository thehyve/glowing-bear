/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Constraint } from './constraint';

export class NegationConstraint extends Constraint {

  private _constraint: Constraint;
  _textRepresentation: string;

  constructor(constraint: Constraint) {
    super();
    this.constraint = constraint;
  }

  get constraint(): Constraint {
    return this._constraint;
  }

  set constraint(value: Constraint) {
    this._constraint = value;
  }

  // this is called by constructor of the super class
  set textRepresentation(rep: string) {
    this._textRepresentation = rep
  }

  get textRepresentation(): string {
    return `Negation: (${this.constraint.textRepresentation})`
  }

  get className(): string {
    return 'NegationConstraint';
  }
}
