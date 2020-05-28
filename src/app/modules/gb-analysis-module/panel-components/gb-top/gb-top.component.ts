import { Component, OnInit } from '@angular/core';
import { AnalysisType } from 'app/models/analyses/analysis-type';

@Component({
  selector: 'app-gb-top',
  templateUrl: './gb-top.component.html',
  styleUrls: ['./gb-top.component.css']
})
export class GbTopComponent implements OnInit {

  _selectedSurvival:boolean
  //_selectedLinearRegression:boolean
  //_selectedLogisticRegression:boolean

  _selected:AnalysisType

  _available=AnalysisType.ALL_TYPES

  constructor() { }

 set selected(sel:AnalysisType){
   if (sel == AnalysisType.SURVIVAL){
     this._selectedSurvival=true
   }
   this._selected=sel
 }


  get selectedSurvival() :boolean{
    return this._selectedSurvival
  }

  get available():AnalysisType[]{
    return this._available
  }

  

  

  ngOnInit() {
  }

}
