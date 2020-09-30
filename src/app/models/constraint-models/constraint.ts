/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SensitiveType } from './sensitive-type';

export class Constraint {

  // The textual representation of this constraint
  protected _textRepresentation: string;
  // The parent constraint
  protected _parentConstraint: Constraint;

  protected _sensitiveType: SensitiveType;


  constructor() {
    this.textRepresentation = '';
    this.parentConstraint = null;
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

  set sensitiveType(st: SensitiveType) {
    this._sensitiveType = st
  }

  get sensitiveType(): SensitiveType {
    return this._sensitiveType
  }

  clone(): Constraint {
    let ret = new Constraint()
    ret.textRepresentation = this.textRepresentation
    ret.sensitiveType = this.sensitiveType
    ret.parentConstraint = (this._parentConstraint) ? this._parentConstraint : null
    return ret
  }
}
