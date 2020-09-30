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
import { numericalTables, NumericalTablesType } from 'app/models/survival-analysis/numericalTables';
import { clearResultsToArray } from 'app/models/survival-analysis/survival-curves';
import { Observable } from 'rxjs';
import { number } from 'mathjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SurvivalResultsService {

  set id(ob: Observable<number>) {
    this._id = ob
  }
  get id(): Observable<number> {
    return this._id
  }

  set survivalResults(res: SurvivalAnalysisClear[]) {
    this._survivalResults = res
  }
  get survivalResults(): SurvivalAnalysisClear[] {
    return this._survivalResults
  }
  set selectedSurvivalResult(res: SurvivalAnalysisClear) {
    this._selectedSurvivalResult = res
  }
  get selectedSurvivalResult(): SurvivalAnalysisClear {
    return this._selectedSurvivalResult
  }
  _id: Observable<number>
  _survivalResults = new Array<SurvivalAnalysisClear>()
  _selectedSurvivalResult: SurvivalAnalysisClear
  _numericalTables = new Array<NumericalTablesType>()
  _selectedNumericalTables: NumericalTablesType

  constructor(private navBarService: NavbarService) {
    this._id = navBarService.selectedSurvivalId.pipe(tap(id => {
      this.selectedSurvivalResult = this.survivalResults[id]
    }))

  }

  pushCopy(surv: SurvivalAnalysisClear) {
    let newSurv = new SurvivalAnalysisClear()
    newSurv.results = surv.results.map(x => {
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
    this.survivalResults.push(newSurv)
    let points = clearResultsToArray(newSurv).curves.map(x => x.points)
    this._numericalTables.push(numericalTables(points))
    this.navBarService.insertNewSurvResults()

  }

}
