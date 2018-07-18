/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Constraint} from './constraint';
import {SubjectSet} from './subject-set';


export class SubjectSetConstraint extends Constraint {
  // external subject Ids
  private _subjectIds = [];
  // internal subject Ids
  private _patientIds = [];
  private _setSize: number;
  private _status: string;
  private _id: number;
  private _description: string;
  private _errorMessage: string;

  constructor(subjectSet?: SubjectSet) {
    super();
    this.textRepresentation = 'Subject set constraint';
    if (subjectSet) {
      this.id = subjectSet.id;
      this.setSize = subjectSet.setSize;
    }
  }

  get className(): string {
    return 'SubjectSetConstraint';
  }

  get subjectIds() {
    return this._subjectIds;
  }

  set subjectIds(value) {
    this._subjectIds = value;
  }

  get patientIds() {
    return this._patientIds;
  }

  set patientIds(value) {
    this._patientIds = value;
  }

  get setSize(): number {
    return this._setSize;
  }

  set setSize(value: number) {
    this._setSize = value;
  }

  get status(): string {
    return this._status;
  }

  set status(value: string) {
    this._status = value;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  get errorMessage(): string {
    return this._errorMessage;
  }

  set errorMessage(value: string) {
    this._errorMessage = value;
  }

}
