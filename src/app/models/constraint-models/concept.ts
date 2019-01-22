/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Aggregate} from '../aggregate-models/aggregate';
import {ConceptType} from './concept-type';
import {CountItem} from '../aggregate-models/count-item';

export class Concept {
  private _path: string;
  private _type: ConceptType;
  // the display text
  private _label: string;
  private _aggregate: Aggregate;
  private _code: string;
  private _name: string;
  private _fullName: string;
  private _counts: CountItem;
  // a flag indicating if the concept is selected/checked/marked
  private _selected = true;

  constructor() {
  }

  copy(): Concept {
    let c = new Concept();
    c.path = this.path;
    c.type = this.type;
    c.label = this.label;
    c.aggregate = this.aggregate;
    c.code = this.code;
    c.name = this.name;
    c.fullName = this.fullName;
    c.counts = this.counts;
    c.selected = this.selected;
    return c;
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

  get selected(): boolean {
    return this._selected;
  }

  set selected(value: boolean) {
    this._selected = value;
  }

  get counts(): CountItem {
    return this._counts;
  }

  set counts(value: CountItem) {
    this._counts = value;
  }
}
