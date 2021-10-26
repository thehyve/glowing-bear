/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { CombinationConstraint } from '../constraint-models/combination-constraint'

import { ApiQueryDefinition } from '../api-request-models/medco-node/api-query-definition'
import {ErrorHelper} from '../../utilities/error-helper';

export class Cohort {
  private _name: string
  private _patient_set_id: Array<number>
  private _queryDefinitions: Array<ApiQueryDefinition>

  public selected: boolean
  private _creationDate: Date[]
  private _updateDate: Date[]

  public bookmarked: boolean
  public visible: boolean


  private _rootConstraint: CombinationConstraint

  constructor(
    name: string, rootConstraint: CombinationConstraint, createDate: Date[],
    updateDate: Date[]
  ) {
    this._name = name

    if (rootConstraint !== null) {

      this._rootConstraint = rootConstraint.clone()
    }

    if (createDate) {
      this._creationDate = createDate
    }

    if (updateDate) {
      this._updateDate = createDate
    }

    this.selected = false
    this.visible = true
  }

  get name(): string {
    return this._name
  }

  get patient_set_id(): Array<number> {
    return new Array(...this._patient_set_id)
  }

  get rootConstraint(): CombinationConstraint {
    if (this._rootConstraint) {
      let cpy = new CombinationConstraint
      cpy.parentConstraint = this._rootConstraint.parentConstraint
      cpy.textRepresentation = this._rootConstraint.textRepresentation

      cpy.children = this._rootConstraint.children
      cpy.combinationState = this._rootConstraint.combinationState
      cpy.isRoot = this._rootConstraint.isRoot

      return cpy
    } else {
      return null
    }
  }

  set rootConstraint(constr: CombinationConstraint) {
    if (constr) {
      let cpy = new CombinationConstraint
      cpy.parentConstraint = constr.parentConstraint
      cpy.textRepresentation = constr.textRepresentation

      cpy.children = constr.children
      cpy.combinationState = constr.combinationState
      cpy.isRoot = constr.isRoot

      this._rootConstraint = cpy

    } else {
      this._rootConstraint = null
    }
  }

  set name(n: string) {
    this._name = n
  }

  set patient_set_id(psid: Array<number>) {
    this._patient_set_id = new Array(...psid)

  }

  set queryDefinition(qd: Array<ApiQueryDefinition>) {
    this._queryDefinitions = qd
  }

  get queryDefinition(): Array<ApiQueryDefinition> {
    return this._queryDefinitions
  }

  get creationDate(): Date[] {
    return this._creationDate
  }

  get updateDate(): Date[] {
    return this._updateDate
  }

  /**
   * hasAllQueryDefinitions checks whether all nodes have returned a query definition
   */
  hasAllQueryDefinitions(): boolean {
    if (this.queryDefinition.length === 0) {
      return false
    }
    for (const definition of this.queryDefinition) {
      if ((definition === null) || (definition === undefined)) {
        return false
      }
    }
    return true

  }

  /**
   * sameQueryDefinitions check if query definitions, grouped by update dates, have the same date.
   * If dates don't match within a group, false is returned.
   */
  sameQueryDefinitions(): boolean {
    let map = new Map<Date, ApiQueryDefinition>()

    for (let i = 0; i < this.updateDate.length; i++) {
      let date = this.updateDate[i]
      let queryDefinition = this.queryDefinition[i]
      if (map.has(date)) {
        let lastDefinition = map.get(date)
        if (lastDefinition !== queryDefinition) {
          return false
        }
      } else {
        map.set(date, queryDefinition)
      }
    }
    return true
  }


  /**
   * mostRecentQueryDefinitions returns the definition with the most recent
   */
  mostRecentQueryDefinition(): ApiQueryDefinition {
    let sortedDef = this.queryDefinition
      .filter(definition => ((definition !== null) || (definition !== undefined)))
      .map((definition, index) => { return { date: this.updateDate[index], definition: definition } })
      .sort((a, b) => (a.date < b.date) ? -1 : 1)

    if (sortedDef.length !== 0) {
      return sortedDef[sortedDef.length - 1].definition
    } else {
      return null
    }
  }

  /**
   * lastUpdateDate returns the most recent update date
   */
  lastUpdateDate(): Date {
    return this._updateDate.reduce((date1, date2) => (date1 > date2) ? date1 : date2)
  }

  /**
   * lastCreationDate returns the most recent creation date
   */
  lastCreationDate(): Date {
    return this._creationDate.reduce((date1, date2) => (date1 > date2) ? date1 : date2)
  }

}
