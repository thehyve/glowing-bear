/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, OnInit } from '@angular/core';
import { AnalysisType } from 'app/models/analyses/analysis-type';

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

  _available=AnalysisType.ALL_TYPES
  ready=false

  constructor() { }

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

  

  ngOnInit() {
  }

}
