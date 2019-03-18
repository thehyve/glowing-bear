/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Constraint} from './constraint';
import {Study} from './study';

export class StudyConstraint extends Constraint {

  private _studies: Study[];

  constructor() {
    super();
    this._studies = [];
  }

  get studies(): Study[] {
    return this._studies;
  }

  set studies(value: Study[]) {
    this._studies = value;
  }

  get className(): string {
    return 'StudyConstraint';
  }

  get textRepresentation(): string {
    let result: string = (this.studies) ? 'Study: ' : 'Study';
    result += this.studies.map(study => study.id).join(', ');
    this._textRepresentation = result;
    return this._textRepresentation;
  }

  set textRepresentation(value: string) {
    this._textRepresentation = value;
  }

  clone(): StudyConstraint {
    const clone = new StudyConstraint();
    clone.studies = this.studies;
    clone.negated = this.negated;
    return clone;
  }

}
