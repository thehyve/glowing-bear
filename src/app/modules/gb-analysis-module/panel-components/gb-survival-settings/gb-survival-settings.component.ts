import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-gb-survival-settings',
  templateUrl: './gb-survival-settings.component.html',
  styleUrls: ['./gb-survival-settings.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GbSurvivalSettingsComponent implements OnInit {
  _activated: boolean

  _granularities= [{label:"Day",value:"Day"},{label:"Week",value:"Week"},{label:"Month",value:"Month"},{label:"Year",value:"Year"}]
  _selectedGranularity="Day"

  _limit=100

  _starts=[{label:"Diagnosis",value:"Diagnosis"},{label:"Treatment",value:"Treatment"}]
  _selectedStart="Treatment"

  _ends=[{label:"Fatality",value:"Fatility"},{label:"Tumor Growth",value:"Tumor Growth"}]
  _selectedEnd="Fatality"

  

  constructor() { }

  ngOnInit() {
  }

  @Input()
  set activated(bool : boolean){
    this._activated=bool
  }

  get activated():boolean{
    return this._activated
  }


  get granularities(){
    return this._granularities
  }

  get selectedGranularity():string{
    return this._selectedGranularity
  }

  set selectedGranularity(gran:string){
    this._selectedGranularity=gran
  }

  get limit() : number{
    return this._limit
  }

  set limit(num:number){
    this._limit=num
  }

  get starts(){
    return this._starts
  }

  set selectedStart(end:string){
    this._selectedStart=end
  }

  get selectedStart():string{
    return this._selectedStart
  }

  get ends(){
    return this._ends
  }

  set selectedEnd(end:string){
    this._selectedEnd=end
  }

  get selectedEnd():string{
    return this._selectedEnd
  }


}
