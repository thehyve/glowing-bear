/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020  LDS EPFL
 * Copyright 2021 CHUV
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
import { MedcoNetworkService } from 'app/services/api/medco-network.service';
import { ApiQueryDefinition } from 'app/models/api-request-models/medco-node/api-query-definition';
import { OperationType } from 'app/models/operation-models/operation-types';
import { SavedCohortsPatientListService } from 'app/services/saved-cohorts-patient-list.service';
import { PatientListOperationStatus } from 'app/models/cohort-models/patient-list-operation-status';

@Component({
  selector: 'gb-explore',
  templateUrl: './gb-explore.component.html',
  styleUrls: ['./gb-explore.component.css']
})
export class GbExploreComponent implements AfterViewChecked {

  OperationType = OperationType

  constructor(private queryService: QueryService,
    private cohortService: CohortService,
    private medcoNetworkService: MedcoNetworkService,
    public constraintService: ConstraintService,
    private changeDetectorRef: ChangeDetectorRef,
    private savedCohortsPatientListService: SavedCohortsPatientListService) {
    this.queryService.lastSuccessfulSet.subscribe(resIDs => {
      this.lastSuccessfulSet = resIDs
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

        let creationDates = new Array<Date>()
        let updateDates = new Array<Date>()
        let queryDefinitions = new Array<ApiQueryDefinition>()
        const nunc = Date.now()
        for (let i = 0; i < this.medcoNetworkService.nodesUrl.length; i++) {
          creationDates.push(new Date(nunc))
          updateDates.push(new Date(nunc))
          let definition = new ApiQueryDefinition()
          definition.panels = this.queryService.lastDefinition
          definition.queryTiming = this.queryService.lastTiming
          queryDefinitions.push(definition)
        }

        let cohort = new Cohort(
          this.cohortName,
          this.constraintService.rootInclusionConstraint,
          this.constraintService.rootExclusionConstraint,
          creationDates,
          updateDates,
        )
        if (queryDefinitions.some(apiDef => (apiDef.panels) || (apiDef.queryTiming))) {
          cohort.queryDefinition = queryDefinitions
        }
        cohort.patient_set_id = this.lastSuccessfulSet
        this.cohortService.postCohort(cohort)
        this.cohortName = ''
        MessageHelper.alert('success', 'Cohort has been sent.')

        // handle patient list locally

        this.queryService.queryResults.subscribe(
          result => {
            if (result.patientLists) {
              this.savedCohortsPatientListService.insertPatientList(this.cohortName, result.patientLists)
              this.savedCohortsPatientListService.statusStorage.set(this.cohortName, PatientListOperationStatus.done)
            }
          }
        )
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

  set lastSuccessfulSet(setIDs: number[]) {
    this.cohortService.lastSuccessfulSet = setIDs
  }
  get lastSuccessfulSet(): number[] {
    return this.cohortService.lastSuccessfulSet
  }
  get globalCount(): Observable<string> {
    return this.queryService.queryResults.pipe(map((queryResults) =>
      queryResults ? FormatHelper.formatCountNumber(queryResults.globalCount) : '0'
    ));
  }
  set cohortName(name: string) {
    this.cohortService.cohortName = name
  }
  get cohortName(): string {
    return this.cohortService.cohortName
  }

  get isUpdating(): boolean {
    return this.queryService.isUpdating
  }

  get isDirty(): boolean {
    return this.queryService.isDirty
  }

  get hasConstraint(): boolean {
    return this.constraintService.hasConstraint().valueOf()
  }


}
