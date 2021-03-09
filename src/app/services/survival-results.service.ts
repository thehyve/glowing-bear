/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { NavbarService } from './navbar.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {SurvivalSettings} from '../models/survival-analysis/survival-settings';
import {clearResultsToArray} from '../models/survival-analysis/survival-curves';
import {SurvivalAnalysisClear} from '../models/survival-analysis/survival-analysis-clear';
import {numericalTables, NumericalTablesType} from '../utilities/survival-analysis/numerical-tables';
import {SurvivalResults} from '../models/survival-analysis/survival-results';

@Injectable()
export class SurvivalResultsService {

  get resultIndex(): number {
    return this._resultIndex;
  }

  set resultIndex(value: number) {
    this._resultIndex = value;
  }
  get survivalResultsIndexes(): number[] {
    return this._survivalResultsIndexes;
  }

  set survivalResultsIndexes(value: number[]) {
    this._survivalResultsIndexes = value;
  }

  set id(ob: Observable<number>) {
    this._id = ob
  }
  get id(): Observable<number> {
    return this._id
  }

  set survivalResults(res: SurvivalResults[]) {
    this._survivalResults = res
  }

  get survivalResults(): SurvivalResults[] {
    return this._survivalResults
  }

  set selectedSurvivalResult(res: SurvivalResults) {
    this._selectedSurvivalResult = res
  }

  get selectedSurvivalResult(): SurvivalResults {
    return this._selectedSurvivalResult
  }

  private _id: Observable<number>
  private _survivalResults = new Array<SurvivalResults>()
  private _survivalResultsIndexes = new Array<number>()
  private _resultIndex: number
  private _selectedSurvivalResult: SurvivalResults
  private _numericalTables = new Array<NumericalTablesType>()

  constructor(private navBarService: NavbarService) {
    this.id = navBarService.selectedSurvivalId.pipe(tap(id => {
      this.selectedSurvivalResult = this.survivalResults[id]
    }))
    navBarService.selectedSurvivalIDtoDelete.subscribe(id => {
      this.survivalResults.splice(id, 1)
      this.survivalResultsIndexes.splice(id, 1)
    })
    this._resultIndex = 0
  }

  pushCopy(surv: SurvivalAnalysisClear, settings: SurvivalSettings) {
    let survivalAnalysisClear = new SurvivalAnalysisClear()
    survivalAnalysisClear.results = surv.results.map(x => {
      x.groupResults = x.groupResults.map(y => {
        let newEvents = {
          censoringEvent: y.events.censoringEvent,
          eventOfInterest: y.events.eventOfInterest,
        }
        y.events = newEvents
        return y
      })
      return x
    })
    let res = new SurvivalResults()
    res.settings = settings
    res.survivalAnalysisClear = survivalAnalysisClear

    let clearPoints = clearResultsToArray(survivalAnalysisClear).curves.map(({points}) => points)
    res.numericalTables = numericalTables(clearPoints)
    this.survivalResults.push(res)
    this.survivalResultsIndexes.push(this.resultIndex)
    this.resultIndex++
    this._numericalTables.push(res.numericalTables)
    this.navBarService.insertNewSurvResults()

  }

  isValidResultIndex(index: number): boolean {
    if (isNaN(index)) {
      return false
    }
    for (let i = 0; i < this.survivalResultsIndexes.length; i++) {
      if (this.survivalResultsIndexes[i] === index) {
        return true
      }
    }
    return false
  }

}
