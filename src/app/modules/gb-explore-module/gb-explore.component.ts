/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020  LDS EPFL
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AfterViewChecked, ChangeDetectorRef, Component } from '@angular/core';
import { FormatHelper } from '../../utilities/format-helper';
import { QueryService } from '../../services/query.service';
import { ExploreQueryType } from '../../models/query-models/explore-query-type';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConstraintService } from '../../services/constraint.service';
import { CohortService } from 'app/services/cohort.service';
import { MessageHelper } from 'app/utilities/message-helper';
import { Cohort } from 'app/models/cohort-models/cohort';
import { OperationType } from 'app/models/operation-models/operation-types';

@Component({
  selector: 'gb-explore',
  templateUrl: './gb-explore.component.html',
  styleUrls: ['./gb-explore.component.css']
})
export class GbExploreComponent implements AfterViewChecked {
  _cohortName: string
  _lastSuccessfulSet: number[]

  OperationType = OperationType

  constructor(public queryService: QueryService,
    private cohortService: CohortService,
    public constraintService: ConstraintService,
    private changeDetectorRef: ChangeDetectorRef) {
    this.queryService.lastSuccessfulSet.subscribe(resIDs => {
      console.log('last_successful_set', resIDs)
      this._lastSuccessfulSet = resIDs
    })
  }

  // without this, ExpressionChangedAfterItHasBeenCheckedError when going from Analysis to Explore
  ngAfterViewChecked() {
    this.changeDetectorRef.detectChanges()
  }

  execQuery(event) {
    event.stopPropagation();
    this.queryService.execQuery();
  }

  save() {
    if (this.cohortName === '') {
      MessageHelper.alert('warn', 'You must provide a name for the cohort you want to save.')
    } else {
      let existingCohorts = this.cohortService.cohorts
      if (existingCohorts.findIndex((cohort => cohort.name === this.cohortName).bind(this)) !== -1) {
        MessageHelper.alert('warn', `Name ${this.cohortName} already used.`)
      } else {


        let cohort = new Cohort(
          this.cohortName,
          this.constraintService.rootInclusionConstraint,
          this.constraintService.rootExclusionConstraint,
          new Date(Date.now()),
          new Date(Date.now())
        )
        cohort.patient_set_id = this.lastSuccessfulSet
        existingCohorts.push(cohort)
        this.cohortService.cohorts = existingCohorts
        this.cohortService.postCohort(cohort)

        MessageHelper.alert('success', 'Cohort has been sent.')
      }
    }
  }

  saveIfEnter(event) {
    if (event.keyCode === 13) {
      this.save()
    }
  }
  // otherwise writes data in input filed
  preventDefault(event: Event) {
    event.preventDefault()
  }

  get queryType(): ExploreQueryType {
    return this.queryService.queryType;
  }

  get lastSuccessfulSet(): number[] {
    return this._lastSuccessfulSet
  }
  get globalCount(): Observable<string> {
    return this.queryService.queryResults.pipe(map((queryResults) =>
      queryResults ? FormatHelper.formatCountNumber(queryResults.globalCount) : '0'
    ));
  }
  set cohortName(name: string) {
    this._cohortName = name
  }
  get cohortName(): string {
    return this._cohortName
  }


}
