/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AfterViewInit, Component, ElementRef, OnInit} from '@angular/core';
import {QueryService} from '../../../../services/query.service';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNode} from '../../../../models/tree-models/tree-node';
import {DropMode} from '../../../../models/drop-mode';
import {FormatHelper} from '../../../../utilities/format-helper';
import {MessageHelper} from '../../../../utilities/message-helper';
import {TreeNodeType} from '../../../../models/tree-models/tree-node-type';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { CohortServiceMock } from 'app/services/cohort.service';
import { Cohort } from 'app/models/cohort-models/cohort';
import { MessageService } from 'primeng/api';



@Component({
  selector: 'gb-summary',
  templateUrl: './gb-summary.component.html',
  styleUrls: ['./gb-summary.component.css']
})
export class GbSummaryComponent {
  _name :string

  constructor(private queryService: QueryService,
    private cohortService: CohortServiceMock) {
      this._name=""
  }

  set name(n: string){
    this._name=n
  }
  get name(): string{
    return this._name
  }

  clearAll() {
    this.queryService.clearAll();
    MessageHelper.alert('success', 'All selections are cleared.');
  }
  save(){
    if (this.name == ""){
      MessageHelper.alert('warn',"You must provide a name for the cohort you want to save.")
    }else{
    var existingCohorts=this.cohortService.cohorts
    if(existingCohorts.findIndex((cohort => cohort.name==this.name).bind(this)) != -1){
      MessageHelper.alert("warn",`Name ${this.name} already used.`)
    }else{
    
    var cohort =new Cohort(this.name,this.queryService.query.constraint)
    existingCohorts.push(cohort)
    this.cohortService.cohorts=existingCohorts
    console.log(this.cohortService.cohorts)
    
    MessageHelper.alert("success","Cohort has been sent.")
    }
    }
  }

  saveIfEnter(event){
    if(event.keyCode == 13){
      this.save()
    }
  }

  get globalCount(): Observable<string> {
    return this.queryService.queryResults.pipe(map((queryResults) =>
      queryResults ? FormatHelper.formatCountNumber(queryResults.globalCount) : '0'
    ));
  }
}
