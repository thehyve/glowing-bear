/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, Input, ViewEncapsulation, ViewChild, ElementRef, AfterViewInit, AfterViewChecked, OnChanges } from '@angular/core';
import { SurvivalAnalysisClear } from 'app/models/survival-analysis/survival-analysis-clear';
import { SurvivalAnalysisServiceMock } from 'app/services/survival-analysis.service';
import { SurvivalCurve, ChiSquaredCdf, SurvivalPoint, clearResultsToArray } from 'app/models/survival-analysis/survival-curves' 

import {SelectItem} from 'primeng/api'
import { logRank2Groups } from 'app/models/survival-analysis/logRankPvalue';

import { identity, logarithm, logarithmMinusLogarithm, arcsineSquaredRoot } from 'app/models/survival-analysis/confidence-intervals';
import { TestEfron } from 'app/models/cox-regression/efron_test';

import { TestBreslow } from 'app/models/cox-regression/breslow_test';
import { NewCoxRegression, coxToString } from 'app/models/cox-regression/coxModel';


@Component({
  selector: 'app-gb-survival-res',
  templateUrl: './gb-survival.component.html',
  styleUrls: ['./gb-survival.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class GbSurvivalComponent implements AfterViewInit,AfterViewChecked,OnChanges{
  _svgSettings: ElementRef
  colorRange=colorRange
  advancedSettings=false

  

  _activated=false

  _cols=["Name","Value"]
  _values=[{name:"log-rank",value:0.9},{name:"p-val",value:0.85}]

  _ic=[{label:"none",value:null},{label:"identity",value:identity},{label:"log",value:logarithm},{label:"log -log",value:logarithmMinusLogarithm},{label :"arcsine squared",value:arcsineSquaredRoot}]
  _selectedIc:  (simga:number,point:{timePoint:number,prob:number,cumul:number,remaining:number}) =>{inf:number,sup:number}


  _grid=false
  _alphas=[{label:"90%",value:1.645},{label:"95%",value:1.960},{label:"99%",value:2.054}]
  _selectedAlpha:number
  _clearRes :SurvivalAnalysisClear


  _logRanks:Array<Array<number>>
  _survivalCurve:SurvivalCurve
  
  _formattedLogRanks:Array<Array<string>>

  _groupComparisons: SelectItem[]
  _selectedGroupComparison: {
    name1:string,
    name2:string,
    color1:string,
    color2:string,
    logrank:string,
    initialCount1: string,
    initialCount2:string,
    cumulatEvent1:string,
    cumulatEvent2: string,
    cumulatCensoring1 : string,
    cumumlatCensoring2: string,
  }
  nofTicks=5

  _groupLogrankTable:Array<Array<string>>
  _groupCoxRegTable:Array<Array<string>>
  _groupCoxWaldTable:Array<Array<string>>
  _groupCoxLogtestTable:Array<Array<string>>
  _groupTotalAtRisk:Array<string>
  _groupTotalEvent:Array<string>
  _groupTotalCensoring:Array<string>

  _groupTables: SelectItem[]
  selectedGroupTable: {legend:string,table:Array<Array<string>>}






  constructor(private survivalService: SurvivalAnalysisServiceMock) { }

  @Input()
  set activated(bool:boolean){
    this._activated=bool  
  }

  get activated() : boolean{
    return this._activated
  }
  ngAfterViewInit(){
    this.survivalService.execute().subscribe((results=>{this._clearRes=results;
      this._survivalCurve=clearResultsToArray(this._clearRes);
      TestEfron()
      TestBreslow()

      this.setGroupComparisons()
      var arrays=this.survivalCurve.curves.map(curve=>curve.points)
      
      


    }).bind(this))
    console.log("after view init",this._svgSettings)


  }
  ngAfterViewChecked(){
    console.log("after view checked",this._svgSettings)

  }
  ngOnChanges(event){
    console.log("after view checked",this._svgSettings)

  }


@ViewChild('svgSettings',{static:false}) set svgSettings(elm: ElementRef){
  this._svgSettings=elm
}

set cols(columns){
  this._cols=columns

}


get cols(){
  return this._cols
}

set values(val){
  this._values=val
}

get values(){
  return this._values
}

get ic(){
  return this._ic
}

set selectedIc(ic){
  this._selectedIc=ic

}

get selectedIc(){
  return this._selectedIc
}


set grid(val:boolean){
  this._grid =val

}

get grid():boolean{
  return this._grid
}

set selectedAlpha(num){
  this._selectedAlpha=num
}

get selectedAlpha(){
  return this._selectedAlpha
}

get alphas(){
  return this._alphas
}
get formattedLogRanks() : Array<Array<string>>{
  return this._formattedLogRanks
}

get survivalCurve():SurvivalCurve{
  return this._survivalCurve
}

get groupLogrankTable(): Array<Array<string>>{
  return this._groupLogrankTable
}

get groupCoxRegTable(): Array<Array<string>>{
  return this._groupCoxRegTable
}
get groupCoxWaldTable():Array<Array<string>>{
  return this._groupCoxWaldTable
}

get groupTables():SelectItem[]{
  return this._groupTables
}

get groupTotalAtRisk(): Array<string>{
  return this._groupTotalAtRisk
}

get groupTotalEvent(): Array<string>{
  return this._groupTotalEvent
}

get groupTotalCensoring(): Array<string>{
  return this._groupTotalCensoring
}

advancedSettingsClick(event : MouseEvent){
  this.advancedSettings = !this.advancedSettings
  var left=document.getElementById('svg-container').clientLeft
  var top=document.getElementById('svg-container').clientTop
  var svgSettings = document.getElementById('svgSettings')
  if (svgSettings){
    svgSettings.setAttribute("style","top:0px;left:0px")
  }
}

setGroupComparisons(){
  this._groupLogrankTable= new Array<Array<string>>()
  this._groupCoxRegTable= new Array<Array<string>>()
  this._groupCoxWaldTable= new Array<Array<string>>()
  this._groupTables= new Array<SelectItem>()
  this._groupTotalAtRisk= new Array<string>()
  this._groupTotalCensoring= new Array<string>()
  this._groupTotalEvent= new Array<string>()
  this._groupCoxLogtestTable = new Array<Array<string>>()
  var len=this.survivalCurve.curves.length
  var curveName=this.survivalCurve.curves.map(curve=>curve.groupId)
  this._groupComparisons=new Array<SelectItem>()
  
  for (let i = 0; i < len; i++) {
    var logrankRow=new Array<string>()
    var coxRegRow= new  Array<string>()
    var waldCoxRow=new Array<string>()
    var coxLogtestRow = new Array<string>()
    var totalAtRisk :string
    var totalEvent :string
    var totalCensoring: string
    for (let j =/*i+1*/ 0; j < len; j++) {
      var logrank =logRank2Groups(this.survivalCurve.curves[i].points,this.survivalCurve.curves[j].points).toPrecision(3)
      logrankRow.push(logrank)
      var cox=NewCoxRegression([this.survivalCurve.curves[i].points,this.survivalCurve.curves[j].points],1000,1e-14,"breslow").run()
      var beta=cox.finalBeta[0]
      var variance= cox.finalCovarianceMatrixEstimate[0][0]
      var coxReg=coxToString(beta,variance)
      var  waldStat=Math.pow(beta,2)/(variance+ 1e-14)
      var waldTest=(1.0-ChiSquaredCdf(waldStat,1)).toPrecision(3)
      var likelihoodRatio= 2.0*(cox.finalLogLikelihood -cox.initialLogLikelihood)
      var coxLogtest=(1.0 -ChiSquaredCdf(likelihoodRatio,1)).toPrecision(3)
      console.log("loglikelihoodRatio",likelihoodRatio,"logtest pvalue",coxLogtest)
      coxRegRow.push(coxReg)
      waldCoxRow.push(waldTest)
      coxLogtestRow.push(coxLogtest)
      totalAtRisk=this.survivalCurve.curves[i].points[0].atRisk.toString()
      totalEvent=this.survivalCurve.curves[i].points.map(p => p.nofEvents).reduce((a,b)=>a+b).toString()
      totalCensoring=this.survivalCurve.curves[i].points.map(p => p.nofCensorings).reduce((a,b)=>a+b).toString()
      this._groupComparisons.push({label:curveName[i]+curveName[j],value:{
        name1:curveName[i],
        name2:curveName[j],
        color1:colorRange[i],
        color2:colorRange[j],
        logrank: logrank,
        coxReg: coxReg,
        initialCount1: totalAtRisk,
        initialCount2: this.survivalCurve.curves[j].points[0].atRisk.toString(),
        //TODO this is redundant
        cumulatEvent1: totalEvent,
        cumulatEvent2: this.survivalCurve.curves[j].points.map(p => p.nofEvents).reduce((a,b)=>a+b).toString(),
        cumulatCensoring1: totalCensoring,
        cumulatCensoring2: this.survivalCurve.curves[j].points.map(p => p.nofCensorings).reduce((a,b)=>a+b).toString(),
      }
    })
      
    }
    this._groupLogrankTable.push(logrankRow)
    this._groupCoxRegTable.push(coxRegRow)
    this._groupCoxWaldTable.push(waldCoxRow)
    this._groupTotalEvent.push(totalEvent)
    this._groupTotalCensoring.push(totalCensoring)
    this._groupTotalAtRisk.push(totalAtRisk)
    this._groupCoxLogtestTable.push(coxLogtestRow)
    
  }
  this._groupTables.push(
    {label:"Haenszel-Mantel LogRank p-value",value:{legend:"KM p-value",table:this._groupLogrankTable}},
    {label:"Cox regression proportional hazard ratio",value:{legend:"Cox PH, [95% CI]",table:this._groupCoxRegTable}},
    {label:"Cox regression Wald test p-value",value:{legend:"Wald p-value",table:this._groupCoxWaldTable}},
    {label:"Cox likelihood ratio p-value",value : {legend:"Logtest p-vale",table:this._groupCoxLogtestTable}})
  this.selectedGroupTable={legend:"KM p-value",table:this._groupLogrankTable}

  if (len){
    this._selectedGroupComparison=this._groupComparisons[0].value
  }
}


get groupComparisons(){
  return this._groupComparisons
}

get selectedGroupComparison(){
  return this._selectedGroupComparison
}

set selectedGroupComparison(selGroup){
  this._selectedGroupComparison=selGroup
}
  



}


export const colorRange=[
  "#ff4f4f",
  "#99f0dd",
  "#fa8d2d",
  "#5c67e6"
]