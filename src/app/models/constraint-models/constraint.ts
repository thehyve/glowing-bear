import {CombinationConstraint} from './combination-constraint';

/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export class Constraint {

  // The textual representation of this constraint
  protected _textRepresentation: string;
  // The parent constraint
  protected _parentConstraint: Constraint;
  // The negation flag indicating whether to add a logical negation to the constraints
  protected _negated: boolean;

  constructor() {
    this.textRepresentation = '';
    this.parentConstraint = null;
    this.negated = false;
  }

  get depth(): number {
    let depth = 0;
    if (this.parentConstraint !== null) {
      depth++;
      depth += this.parentConstraint.depth;
    }
    return depth;
  }

  get parentDimension(): string {
    if (this.parentConstraint) {
      if (this.parentConstraint.className === 'CombinationConstraint') {
        return (<CombinationConstraint>this.parentConstraint).dimension;
      } else if (this.parentConstraint.className === 'PedigreeConstraint') {
        return this.parentConstraint.parentDimension;
      }
    }
    return null;
  }

  get negated(): boolean {
    return this._negated;
  }

  set negated(value: boolean) {
    this._negated = value;
  }

  get textRepresentation(): string {
    return this._textRepresentation;
  }

  set textRepresentation(value: string) {
    this._textRepresentation = value;
  }

  get parentConstraint(): Constraint {
    return this._parentConstraint;
  }

  set parentConstraint(value: Constraint) {
    this._parentConstraint = value;
  }

  get className(): string {
    return 'Constraint';
  }
}
