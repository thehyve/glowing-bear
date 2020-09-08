/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020  LDS EPFL
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {FormatHelper} from '../../utilities/format-helper';
import {QueryService} from '../../services/query.service';
import {ExploreQueryType} from '../../models/query-models/explore-query-type';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ConstraintService} from '../../services/constraint.service';
import { CohortServiceMock } from 'app/services/cohort.service';
import { MessageHelper } from 'app/utilities/message-helper';
import { Cohort } from 'app/models/cohort-models/cohort';

@Component({
  selector: 'gb-explore',
  templateUrl: './gb-explore.component.html',
  styleUrls: ['./gb-explore.component.css']
})
export class GbExploreComponent {
  public name:string
  private _lastSuccessfulSet:number[]

  constructor(public queryService: QueryService,
              private cohortService: CohortServiceMock,
              public constraintService: ConstraintService) {
              this.queryService.lastSuccessfulSet.subscribe(resIDs=>{this._lastSuccessfulSet=resIDs})
  }

  get globalCount(): Observable<string> {
    return this.queryService.queryResults.pipe(map((queryResults) =>
      queryResults ? FormatHelper.formatCountNumber(queryResults.globalCount) : '0'
    ));
  }

  execQuery(event) {
    event.stopPropagation();
    this.queryService.execQuery();
  }

  get queryType(): ExploreQueryType {
    return this.queryService.query.type;
  }

  set queryType(val: ExploreQueryType) {
    this.queryService.query.type = val;
    this.queryService.isDirty = true;
  }

  get lastSuccessfulSet(): number[]{
    return this._lastSuccessfulSet
  }

  save(){
    if (this.name == ""){
      MessageHelper.alert('warn',"You must provide a name for the cohort you want to save.")
    }else{
    var existingCohorts=this.cohortService.cohorts
    if(existingCohorts.findIndex((cohort => cohort.name==this.name).bind(this)) != -1){
      MessageHelper.alert("warn",`Name ${this.name} already used.`)
    }else{

 
    var cohort =new Cohort(this.name,this.constraintService.rootInclusionConstraint,this.constraintService.rootExclusionConstraint,new Date(Date.now()),new Date(Date.now()))
    //TODO parametrize this
    cohort.patient_set_id=[-1,-1,-1]
    existingCohorts.push(cohort)
    this.cohortService.cohorts=existingCohorts
    this.cohortService.postCohort(cohort)
    
    MessageHelper.alert("success","Cohort has been sent.")
    }
    }
  }

  saveIfEnter(event){
    if(event.keyCode == 13){
      this.save()
    }
  }


}
