import { Component, OnInit,OnChanges, Input, AfterViewInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';

import {select,scaleLinear, scaleOrdinal, scaleBand, line, nest, curveStepBefore, axisBottom,axisLeft} from 'd3'
import { SurvivalAnalysisClear } from 'app/models/survival-analysis/survival-analysis-clear';
import { SurvivalAnalysis } from 'app/models/api-request-models/survival-analyis/survival-analysis';
import { SurvivalAnalysisServiceMock } from 'app/services/survival-analysis.service';


@Component({
  selector: 'app-gb-survival-res',
  templateUrl: './gb-survival.component.html',
  styleUrls: ['./gb-survival.component.css']
})
export class GbSurvivalComponent implements OnInit{

  _activated=false
  




  constructor(private survivalService: SurvivalAnalysisServiceMock) { }

  @Input()
  set activated(bool:boolean){
    this._activated=bool  
  }

  get activated() : boolean{
    return this._activated
  }
  ngOnInit(){}
  /*

  ngAfterViewInit() {
    this.survivalService.execute().subscribe((results=>{this._clearRes=results;
      this._curves=clearResultsToArray(this._clearRes)
    }).bind(this))
    this.buildLineChart()
  }

  ngOnChanges(changes){

    console.log("I've changed",this._activated)
    console.log("executing")
    this.survivalService.execute().subscribe((results=>{this._clearRes=results;
      this._curves=clearResultsToArray(this._clearRes)
    }).bind(this))
    this.buildLineChart()
    console.log("executed")
  }
*/

  



}



