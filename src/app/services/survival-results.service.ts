/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';

import { SurvivalAnalysisClear } from 'app/models/survival-analysis/survival-analysis-clear';

import { NavbarService } from './navbar.service';
import { clearResultsToArray } from 'app/models/survival-analysis/survival-curves';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SurvivalSettings } from 'app/models/survival-analysis/survival-settings';
import { NumericalTablesType, numericalTables } from 'app/utilities/survival-analysis/numerical-tables';
import { SurvivalResults } from 'app/models/survival-analysis/survival-results';

@Injectable()
export class SurvivalResultsService {

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
  _id: Observable<number>
  _survivalResults = new Array<SurvivalResults>()
  _selectedSurvivalResult: SurvivalResults
  _numericalTables = new Array<NumericalTablesType>()
  _selectedNumericalTables: NumericalTablesType

  constructor(private navBarService: NavbarService) {
    this._id = navBarService.selectedSurvivalId.pipe(tap(id => {
      this.selectedSurvivalResult = this.survivalResults[id]
    }))

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
    this._numericalTables.push(res.numericalTables)
    this.navBarService.insertNewSurvResults()

  }

}
