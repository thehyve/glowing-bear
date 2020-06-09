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
    this.cohortService.addSubgroupToSelected(this.subgroupName,this.constraintService.rootInclusionConstraint,this.constraintService.rootExclusionConstraint)

    this._subgroupName=""
  }

  close(){
    this._activated=false
    this.activatedChange.emit(false)
  }
}
