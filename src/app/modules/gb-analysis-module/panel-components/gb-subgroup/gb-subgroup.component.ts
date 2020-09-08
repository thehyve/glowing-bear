/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CohortServiceMock } from 'app/services/cohort.service';
import { ConstraintService } from 'app/services/constraint.service';
import { SurvivalCohort, Cohort } from 'app/models/cohort-models/cohort';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-gb-subgroup',
  templateUrl: './gb-subgroup.component.html',
  styleUrls: ['./gb-subgroup.component.css']
})
export class GbSubgroupComponent implements OnInit {

  _activated=false
  _subgroupName:string
  _selectedSubGroup : Cohort

  constructor(private cohortService: CohortServiceMock,
    private constraintService: ConstraintService) { }

  ngOnInit() {
  }

  @Input()
  set activated(val:boolean){
    this._activated=val
  }

  
  get activated():boolean{
    return this._activated
  }

  @Output()
  activatedChange=new EventEmitter<boolean>();

  set subgroupName(val:string){
    this._subgroupName=val
  }

  get subgroupName() :string{
    return this._subgroupName
  }
  save(){
    console.log("before saving subgroup",this.cohortService.selectedCohort)
    this.cohortService.addSubgroupToSelected(this.subgroupName,this.constraintService.rootInclusionConstraint,this.constraintService.rootExclusionConstraint)
    console.log("after saving subgroup",this.cohortService.selectedCohort)
    this._subgroupName=""
    this._activated=false
    this.activatedChange.emit(false)
  }

  changeSubgroupDisplay(subGroupName :string){
     if (this.cohortService.selectedCohort instanceof SurvivalCohort){
      var subGroups=(this.cohortService.selectedCohort as SurvivalCohort).subGroups
      var selected =subGroups.find(c=>c.name==subGroupName)
      if(selected){
        this.constraintService.rootInclusionConstraint=selected.rootInclusionConstraint
        this.constraintService.rootExclusionConstraint=selected.rootExclusionConstraint
        console.log("constaintService",this.constraintService)
      }else{
        console.error(`Group ${subGroupName} not found`)
      }

     }else{
       console.error("no survival cohort is selected")
     }
  }
  @Input()
  set selectedSubGroup(sg:Cohort){
    console.log("sg",sg)
    this._selectedSubGroup=sg
    if (this._selectedSubGroup){
      this.changeSubgroupDisplay(sg.name)
    }
  }

  get selectedSubGroup():Cohort{
    return this._selectedSubGroup
  }

  close(){
    this._activated=false
    this.activatedChange.emit(false)
  }
}
