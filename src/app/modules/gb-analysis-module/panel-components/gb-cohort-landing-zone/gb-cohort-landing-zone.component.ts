import { Component, OnInit, Input } from '@angular/core';
import { CohortService, CohortServiceMock } from 'app/services/cohort.service';
import { Cohort } from 'app/models/cohort-models/cohort';

@Component({
  selector: 'app-gb-cohort-landing-zone',
  templateUrl: './gb-cohort-landing-zone.component.html',
  styleUrls: ['./gb-cohort-landing-zone.component.css']
})
export class GbCohortLandingZoneComponent implements OnInit {
  _activated=false
  _dedicated=false
  _cohort:Cohort

  constructor(private cohortService:CohortServiceMock) { }

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


  drop(event){
    console.log("dopevent !!",this.cohortService)
    if (this.cohortService.selectedCohort != null){
      this._cohort=this.cohortService.selectedCohort
      this.dedicated=true

    }
    
  }
  draggingmode(event){
    event.preventDefault()

  }

  dragenter(event){
    
    
    
  }

}
