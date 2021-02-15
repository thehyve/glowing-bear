/**
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, OnInit } from '@angular/core';
import { AnalysisType } from 'app/models/analysis-models/analysis-type';
import { ApiSurvivalAnalysisResponse } from 'app/models/api-response-models/survival-analysis/survival-analysis-response';
import { SurvivalAnalysisClear } from 'app/models/survival-analysis/survival-analysis-clear';
import { Subject, Observable } from 'rxjs';
import { ApiI2b2Panel } from 'app/models/api-request-models/medco-node/api-i2b2-panel';
import { ApiI2b2Item } from 'app/models/api-request-models/medco-node/api-i2b2-item';
import { MessageHelper } from 'app/utilities/message-helper';

import { SurvivalResultsService } from 'app/services/survival-results.service';
import { CohortService } from 'app/services/cohort.service';
import { SurvivalService } from 'app/services/survival-analysis.service';
import { delay, tap } from 'rxjs/operators';
import { OperationStatus } from 'app/models/operation-status';
import { NavbarService } from 'app/services/navbar.service';
import { AnalysisService } from 'app/services/analysis.service';

@Component({
  selector: 'gb-top',
  templateUrl: './gb-top.component.html',
  styleUrls: ['./gb-top.component.css']
})
export class GbTopComponent implements OnInit {
  launched = false

  _selectedSurvival: boolean
  // _selectedLinearRegression:boolean
  // _selectedLogisticRegression:boolean

  _clearRes: Subject<SurvivalAnalysisClear>
  _available = AnalysisType.ALL_TYPES
  _survivalAnalysisResponses: ApiSurvivalAnalysisResponse[]
  _ready = false

  OperationStatus = OperationStatus
  _operationStatus: OperationStatus

  private static filterResults(res: SurvivalAnalysisClear): SurvivalAnalysisClear {
    let ret = new SurvivalAnalysisClear()
    ret.results = new Array()
    for (const result of res.results) {
      if (result.groupResults.length > 0) {
        ret.results.push(result)
      } else {
        MessageHelper.alert('warn', `No observation available for group ${result.groupId} within the given time limit`)
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

  isCompleted(event: boolean) {
    this._ready = event
  }

  runAnalysis() {
    this._ready = false
    this.launched = true
    let settings = this.survivalAnalysisService.settings()
    try {
      this.operationStatus = OperationStatus.waitOnAPI
      this.survivalAnalysisService.runSurvivalAnalysis()
        .pipe(
          tap(() => { this.operationStatus = OperationStatus.decryption },
            err => {
              this.operationStatus = OperationStatus.error
              MessageHelper.alert('error', (err as Error).message)
            }),
          delay(100)
        )
        .subscribe(res => {
          this.launched = false
          console.log(res)
          this._survivalAnalysisResponses = res

          let survivalAnalysisClear: SurvivalAnalysisClear
          try {
            survivalAnalysisClear = this.survivalAnalysisService.survivalAnalysisDecrypt(this._survivalAnalysisResponses[0])
          } catch (err) {
            MessageHelper.alert('error', 'while decrypting survival analysis: ' + (err as Error).message)
            this.operationStatus = OperationStatus.error
            return
          }
          this.operationStatus = OperationStatus.done
          let survivalFiltered = GbTopComponent.filterResults(survivalAnalysisClear)
          if (!(survivalFiltered.results) || survivalFiltered.results.length === 0) {
            return
          }
          this._clearRes.next(survivalAnalysisClear)
          this.survivalResultsService.pushCopy(survivalAnalysisClear, settings)
          this._ready = true

          this.navbarService.navigateToNewResults()

        })
    } catch (exception) {
      this.operationStatus = OperationStatus.error
      console.log(exception as Error)
      MessageHelper.alert('error', (exception as Error).message)
      return
    }
    this._ready = true
    this.launched = false


  }

  get clearRes(): Observable<SurvivalAnalysisClear> {
    return this._clearRes.asObservable()
  }

  get ready(): boolean {
    return this._ready &&
      this.selected !== undefined &&
      this.cohortService.selectedCohort !== undefined
  }


  ngOnInit() {
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
  firstPanel.items.push(firstItem)

  testPanels[0].panels.push(firstPanel)

  let secondPanel = new ApiI2b2Panel()
  secondPanel.not = false
  let secondItem = new ApiI2b2Item()
  secondItem.encrypted = false
  secondItem.queryTerm = '/I2B2/I2B2/Demographics/Gender/Male/'
  secondItem.operator = 'equals'
  secondPanel.items.push(secondItem)

  testPanels[1].panels.push(secondPanel)
}

