/**
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { AnalysisType } from '../../../../models/analysis-models/analysis-type';
import { ApiI2b2Panel } from '../../../../models/api-request-models/medco-node/api-i2b2-panel';
import { MessageHelper } from '../../../../utilities/message-helper';
import { switchMap, tap } from 'rxjs/operators';
import { SurvivalAnalysisClear } from '../../../../models/survival-analysis/survival-analysis-clear';
import { CohortService } from '../../../../services/cohort.service';
import { NavbarService } from '../../../../services/navbar.service';
import { ApiI2b2Item } from '../../../../models/api-request-models/medco-node/api-i2b2-item';
import { OperationStatus } from '../../../../models/operation-status';
import { SurvivalService } from '../../../../services/survival-analysis.service';
import { SurvivalResultsService } from '../../../../services/survival-results.service';
import { AnalysisService } from '../../../../services/analysis.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Cohort } from 'src/app/models/cohort-models/cohort';
import {UserInputError} from '../../../../utilities/user-input-error';
import {ErrorHelper} from '../../../../utilities/error-helper';

@Component({
  selector: 'gb-top',
  templateUrl: './gb-top.component.html',
  styleUrls: ['./gb-top.component.css']
})
export class GbTopComponent {
  _selectedSurvival: boolean

  _clearRes: Subject<SurvivalAnalysisClear>
  _available = AnalysisType.ALL_TYPES
  _ready = false

  OperationStatus = OperationStatus
  _operationStatus: OperationStatus

  private static filterResults(res: SurvivalAnalysisClear): SurvivalAnalysisClear {
    let ret = new SurvivalAnalysisClear();
    ret.results = [];
    for (const result of res.results) {
      if (result.groupResults.length > 0) {
        ret.results.push(result);
      } else {
        MessageHelper.alert('warn', `No observation available for group ${result.groupId} within the given time limit`);
      }
    }
    return ret
  }

  constructor(private analysisService: AnalysisService,
    private survivalAnalysisService: SurvivalService,
    private survivalResultsService: SurvivalResultsService,
    private cohortService: CohortService,
    private navbarService: NavbarService) {
    this._clearRes = new Subject<SurvivalAnalysisClear>()
    this.operationStatus = OperationStatus.done
  }

  get expanded(): boolean {
    return this.analysisService.analysisTypeExpanded
  }

  set expanded(val: boolean) {
    this.analysisService.analysisTypeExpanded = val
  }

  set selected(sel: AnalysisType) {
    if (sel === AnalysisType.SURVIVAL) {
      this._selectedSurvival = true
    }
    this.analysisService.selected = AnalysisType.SURVIVAL
  }

  get selected(): AnalysisType {
    return this.analysisService.selected
  }


  get selectedSurvival(): boolean {
    return this.analysisService.selected === AnalysisType.SURVIVAL
  }

  get available(): AnalysisType[] {
    return this._available
  }

  set operationStatus(opStat: OperationStatus) {
    this._operationStatus = opStat
  }

  get operationStatus(): OperationStatus {
    return this._operationStatus
  }

  isReady(event: boolean) {
    this._ready = event
  }

  runAnalysis() {
    this._ready = false
    let settings = this.survivalAnalysisService.settings()
    settings.cohortName = this.cohortService.selectedCohort.name

    this.operationStatus = OperationStatus.waitOnAPI
    this.survivalAnalysisService.runSurvivalAnalysis().pipe(
      tap(() => { this.operationStatus = OperationStatus.decryption }),
      switchMap(encryptedResult => this.survivalAnalysisService.survivalAnalysisDecrypt(encryptedResult[0]))
    ).subscribe(clearResult => {
      console.log('[ANALYSIS] Decrypted survival analysis result', clearResult);
      this.operationStatus = OperationStatus.done

      let survivalFiltered = GbTopComponent.filterResults(clearResult)
      if (!(survivalFiltered.results) || survivalFiltered.results.length === 0) {
        return
      }
      this._clearRes.next(survivalFiltered)
      this.survivalResultsService.pushCopy(survivalFiltered, settings)
      this._ready = true

      this.navbarService.navigateToNewResults()
    }, err => {
      if (err instanceof UserInputError) {
        console.warn(`[ANALYSIS] Interrupted survival analysis query (cohort ${settings.cohortName}) due to user input error.`, err);
      } else if (err instanceof HttpErrorResponse) {
        ErrorHelper.handleError(`Server error during survival analysis query (cohort ${settings.cohortName}): ${(err as HttpErrorResponse).error.message}`, err);
      } else {
        ErrorHelper.handleError(`Error during survival analysis (cohort ${settings.cohortName}).`, err);
      }
      this.operationStatus = OperationStatus.error
      this._ready = true
    })
  }

  get clearRes(): Observable<SurvivalAnalysisClear> {
    return this._clearRes.asObservable()
  }

  get ready(): boolean {
    return this._ready &&
      this.selected !== undefined
  }

  get selectedCohort(): Cohort {
    return this.cohortService.selectedCohort
  }
}

let testPanels = [{
  cohortName: 'group1',
  panels: new Array<ApiI2b2Panel>()
}, {
  cohortName: 'group2',
  panels: new Array<ApiI2b2Panel>()
}]

function fillTestPanels() {
  let firstPanel = new ApiI2b2Panel()
  firstPanel.not = false
  let firstItem = new ApiI2b2Item()
  firstItem.encrypted = false
  firstItem.queryTerm = '/I2B2/I2B2/Demographics/Gender/Female/'
  firstItem.operator = 'equals'
  firstPanel.conceptItems.push(firstItem)

  testPanels[0].panels.push(firstPanel)

  let secondPanel = new ApiI2b2Panel()
  secondPanel.not = false
  let secondItem = new ApiI2b2Item()
  secondItem.encrypted = false
  secondItem.queryTerm = '/I2B2/I2B2/Demographics/Gender/Male/'
  secondItem.operator = 'equals'
  secondPanel.conceptItems.push(secondItem)

  testPanels[1].panels.push(secondPanel)
}

