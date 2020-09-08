/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, OnInit } from '@angular/core';
import { AnalysisType } from 'app/models/analyses/analysis-type';
import { SurvivalAnalysisServiceMock } from 'app/services/survival-analysis.service';
import { ApiSurvivalAnalysisResponse } from 'app/models/api-request-models/survival-analyis/survival-analysis-response';
import { SurvivalAnalysisClear } from 'app/models/survival-analysis/survival-analysis-clear';
import { Subject, Observable, throwError } from 'rxjs';
import { ApiI2b2Panel } from 'app/models/api-request-models/medco-node/api-i2b2-panel';
import { ApiI2b2Item } from 'app/models/api-request-models/medco-node/api-i2b2-item';
import { MessageHelper } from 'app/utilities/message-helper';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-gb-top',
  templateUrl: './gb-top.component.html',
  styleUrls: ['./gb-top.component.css']
})
export class GbTopComponent implements OnInit {
  ran=false

  _selectedSurvival:boolean
  //_selectedLinearRegression:boolean
  //_selectedLogisticRegression:boolean

  _selected:AnalysisType
  _clearRes: Subject<SurvivalAnalysisClear>
  _available=AnalysisType.ALL_TYPES
  _survivalAnalysisResponses : ApiSurvivalAnalysisResponse[]
  ready=false

  constructor(private survivalAnalysisService: SurvivalAnalysisServiceMock) { 
    this._clearRes = new Subject<SurvivalAnalysisClear>()
  }

 set selected(sel:AnalysisType){
   if (sel == AnalysisType.SURVIVAL){
     this._selectedSurvival=true
   }
   this._selected=sel
 }

 get selected():AnalysisType{
   return this._selected
 }


  get selectedSurvival() :boolean{
    return this._selectedSurvival
  }

  get available():AnalysisType[]{
    return this._available
  }

  isReady(event:boolean){
    this.ready=event
  }

  isCompleted(event:boolean){
    this.ready=event
  }

  runAnalysis(){
    fillTestPanels()
    this.ready=false
    try{
    this.survivalAnalysisService.runSurvivalAnalysis()
      .subscribe(res=>{
        console.log(res)
        this._survivalAnalysisResponses=res
        var finalResult =this.survivalAnalysisService.survivalAnalysisDecrypt(this._survivalAnalysisResponses[0])
        this._clearRes.next(finalResult)
        this.ran=true
      })
    } catch(exception){
      console.log(exception as Error)
      MessageHelper.alert('error',(exception as Error).message)
      this.ready=true
    }

    
  }

  get clearRes() :Observable<SurvivalAnalysisClear>{
    return this._clearRes.asObservable()
  }
  

  ngOnInit() {
    
  }

}


var testPanels=[ {
  cohortName: "group1",
  panels: new Array<ApiI2b2Panel>()
},{
  cohortName: "group2",
  panels: new Array<ApiI2b2Panel>()
}]

function fillTestPanels(){
  var firstPanel = new ApiI2b2Panel()
  firstPanel.not=false
  var firstItem=new ApiI2b2Item()
  firstItem.encrypted=false
  firstItem.queryTerm="/I2B2/I2B2/Demographics/Gender/Female/"
  firstItem.operator="equals"
  firstPanel.items.push(firstItem)

  testPanels[0].panels.push(firstPanel)

  var secondPanel = new ApiI2b2Panel()
  secondPanel.not=false
  var secondItem=new ApiI2b2Item()
  secondItem.encrypted=false
  secondItem.queryTerm="/I2B2/I2B2/Demographics/Gender/Male/"
  secondItem.operator="equals"
  secondPanel.items.push(secondItem)

  testPanels[1].panels.push(secondPanel)
}