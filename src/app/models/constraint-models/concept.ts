/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Aggregate} from '../aggregate-models/aggregate';
import {ConceptType} from './concept-type';
import {MedcoEncryptionDescriptor} from "../tree-models/medco-encryption-descriptor";

export class Concept {
  private _path: string;
  private _type: ConceptType;
  // the display text
  private _label: string;
  private _aggregate: Aggregate;
  private _code: string;
  private _name: string;
  private _fullName: string;
  private _encryptionDescriptor?: MedcoEncryptionDescriptor;

  constructor() {
  }

  get path(): string {
    return this._path;
  }

  set path(value: string) {
    this._path = value;
  }

  get type(): ConceptType {
    return this._type;
  }

  set type(value: ConceptType) {
    this._type = value;
  }

  get aggregate(): Aggregate {
    return this._aggregate;
  }

  set aggregate(value: Aggregate) {
    this._aggregate = value;
  }

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }

  get code(): string {
    return this._code;
  }

  set code(value: string) {
    this._code = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get fullName(): string {
    return this._fullName;
  }

  set fullName(value: string) {
    this._fullName = value;
  }

  get encryptionDescriptor(): MedcoEncryptionDescriptor {
    return this._encryptionDescriptor;
  }

  set encryptionDescriptor(value: MedcoEncryptionDescriptor) {
    this._encryptionDescriptor = value;
  }
}
