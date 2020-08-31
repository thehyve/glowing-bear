/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Constraint} from '../constraint-models/constraint';
import {ExploreQueryType} from './explore-query-type';

export class ExploreQuery {

  private _uniqueId: string;
  private _name: string;
  private _description: string;
  // the constraint of the query
  private _constraint: Constraint;
  //the superset where to restrict the patient set if provided, one per site
  private _super_set_id: Array<number>;
  // the type of the query
  private _type: ExploreQueryType;

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
      id = `${id}_${this.name.replace(/\s/g, '_')}`;
    }

    this.uniqueId = id;
  }

  get hasPerSiteCounts(): boolean {
    return this.hasPatientLists ||
      this.type === ExploreQueryType.COUNT_PER_SITE ||
      this.type === ExploreQueryType.COUNT_PER_SITE_OBFUSCATED ||
      this.type === ExploreQueryType.COUNT_PER_SITE_SHUFFLED ||
      this.type === ExploreQueryType.COUNT_PER_SITE_SHUFFLED_OBFUSCATED;
  }

  get hasPatientLists(): boolean {
    return this.type === ExploreQueryType.PATIENT_LIST;
  }
  get superSetId(): Array<number> {
    return new Array(...this._super_set_id)
  }

  set superSetId(ids : Array<number>){
    this._super_set_id=new Array(...ids)
  }


  // --- getters / setters
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

  get type(): ExploreQueryType {
    return this._type;
  }

  set type(value: ExploreQueryType) {
    this._type = value;
  }
}
