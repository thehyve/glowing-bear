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

@Component({
  selector: 'app-gb-subgroup',
  templateUrl: './gb-subgroup.component.html',
  styleUrls: ['./gb-subgroup.component.css']
})
export class GbSubgroupComponent implements OnInit {

  _activated=false
  _subgroupName:string

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

  close(){
    this._activated=false
    this.activatedChange.emit(false)
  }
}
