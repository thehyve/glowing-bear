import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CohortService, CohortServiceMock } from 'app/services/cohort.service';
import { Cohort, SurvivalCohort } from 'app/models/cohort-models/cohort';
import { SurvivalAnalysis } from 'app/models/api-request-models/survival-analyis/survival-analysis';

@Component({
  selector: 'app-gb-cohort-landing-zone',
  templateUrl: './gb-cohort-landing-zone.component.html',
  styleUrls: ['./gb-cohort-landing-zone.component.css']
})
export class GbCohortLandingZoneComponent implements OnInit {
  _activated=false
  _dedicated=false
  _subgroup=false
  _cohort:Cohort
  _ran=false
  _selectedSubgroup : Cohort

  constructor(private cohortService:CohortServiceMock) {
    if (this.cohortService.selectedCohort){
      this._cohort=this.cohortService.selectedCohort
      this.dedicated=true
    }
    cohortService.selectingCohort.subscribe((cohort =>{
      this._cohort=cohort;
      this._dedicated = (this._cohort !=null)
    }).bind(this))
  }

  ngOnInit() {
  }


  @Input()
  set activated(bool:boolean){
    this._activated=bool
  }
  get activated() :boolean{
    return this._activated
  }

  set dedicated(bool:boolean){
    this._dedicated=bool
  }
  get dedicated() :boolean{
    return this._dedicated
  }

  get cohort(): Cohort{
    return this._cohort
  }

  set subgroup(val:boolean){
    this._subgroup=val
  }

  get subgroup():boolean{
    return this._subgroup
  }


  drop(event:DragEvent){
    event.preventDefault()
    

    if (this.cohortService.selectedCohort != null  && event.dataTransfer.getData("text")=="cohort")
    {
      
      this._cohort=this.cohortService.selectedCohort
      this.dedicated=true


    }
    
  }
  draggingmode(event:DragEvent){
    event.preventDefault()
    event.stopPropagation()
      
   

  }


  get ran():boolean{
    return this._ran
  }

  run(){

    this._ran=true

  }
  get subGroups(){
    return (this.cohort as SurvivalCohort).subGroups.map(group=>{return {label:group.name,value:group}})
  }
  get isSurv(){
    return this.cohort instanceof SurvivalCohort
  }
  set selectedSubGroup(cohort: Cohort) {
    this._selectedSubgroup=cohort

  }

  get selectedSubGroup(): Cohort{
    return this._selectedSubgroup
  }


}
