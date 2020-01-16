/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Constraint} from '../constraint-models/constraint';
import {ExploreQueryType} from "./explore-query-type";

export class ExploreQuery {

  private _uniqueId: string;
  private _name: string;
  private _description: string;
  private _createDate: string;
  // The information about the creation date, e.g. 3 days ago
  private _createDateInfo: string;
  private _updateDate: string;
  // The information about the update date, e.g. 3 days ago
  private _updateDateInfo: string;
  private _apiVersion: string;
  // the constraint of the query
  private _constraint: Constraint;
  // the type of the query
  private _type: ExploreQueryType = ExploreQueryType.COUNT_GLOBAL_OBFUSCATED; // todo: check if that should be the default

  constructor(name?: string) {
    this.name = name;
    this.generateUniqueId();
  }

  /**
   * Generates a new unique ID for this query.
   */
  generateUniqueId(): void {
    let d = new Date();
    let id = `MedCo_Explore_Query_${d.getUTCFullYear()}${d.getUTCMonth()}${d.getUTCDate()}${d.getUTCHours()}` +
      `${d.getUTCMinutes()}${d.getUTCSeconds()}${d.getUTCMilliseconds()}`;

    if (this.name) {
      // embed name without whitespaces if defined
      id = `${id}_${this.name.replace(/\s/g, "_")}`;
    }

    this.uniqueId = id;
  }

  get uniqueId(): string {
    return this._uniqueId;
  }

  set uniqueId(uniqueId: string) {
    this._uniqueId = uniqueId;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  get constraint(): Constraint {
    return this._constraint;
  }

  set constraint(value: Constraint) {
    this._constraint = value;
  }

  get createDate(): string {
    return this._createDate;
  }

  set createDate(value: string) {
    this._createDate = value;
  }

  get updateDate(): string {
    return this._updateDate;
  }

  set updateDate(value: string) {
    this._updateDate = value;
  }

  get apiVersion(): string {
    return this._apiVersion;
  }

  set apiVersion(value: string) {
    this._apiVersion = value;
  }

  get createDateInfo(): string {
    return this._createDateInfo;
  }

  set createDateInfo(value: string) {
    this._createDateInfo = value;
  }

  get updateDateInfo(): string {
    return this._updateDateInfo;
  }

  set updateDateInfo(value: string) {
    this._updateDateInfo = value;
  }

  get type(): ExploreQueryType {
    return this._type;
  }

  set type(value: ExploreQueryType) {
    this._type = value;
  }
}
