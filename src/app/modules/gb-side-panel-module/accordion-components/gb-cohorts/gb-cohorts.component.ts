/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit, ElementRef} from '@angular/core';
import { Cohort } from 'app/models/cohort-models/cohort';
import {CohortService, CohortServiceMock } from 'app/services/cohort.service';

@Component({
  selector: 'gb-cohorts',
  templateUrl: './gb-cohorts.component.html',
  styleUrls: ['./gb-cohorts.component.css']
})
export class GbCohortsComponent implements OnInit {

  public readonly fileElementId: string = 'cohortFileUpload';
  searchTerm = '';
  
  file: File; // holds the uploaded cohort file


 constructor(private cohortService: CohortServiceMock){}

 get cohorts() : Array<Cohort> {

   return this.cohortService.cohorts
 }
 get selectedCohort() : Cohort{
   return this.cohortService.selectedCohort
 }
 set selectedCohort(cohort: Cohort){
   this.cohortService.selectedCohort=cohort
 }

  ngOnInit() {
    
  }

  dragdebug(event,cohort:Cohort){

    this.cohortService.selectedCohort=cohort
    


  }

 



  toggleBookmark(e: Event, cohort :Cohort){
    e.stopPropagation()
  }

  downloadCohort(e: Event, cohort: Cohort){
    e.stopPropagation()
  }

  restoreCohort(e:Event,cohort : Cohort){
    e.stopPropagation()
  }


}
