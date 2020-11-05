/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Injectable } from '@angular/core';
import { Cohort } from 'app/models/cohort-models/cohort';
import { Observable, of, Subject } from 'rxjs';
import { ExploreQueryService } from './api/medco-node/explore-query.service';
import { MedcoNetworkService } from './api/medco-network.service';
import { CombinationConstraint } from 'app/models/constraint-models/combination-constraint';
import { ConstraintService } from './constraint.service';
import { ExploreCohortsService } from './api/medco-node/explore-cohorts.service';
import { MessageHelper } from 'app/utilities/message-helper';
import { ApiCohort } from 'app/models/api-request-models/medco-node/api-cohort';
import { ErrorHelper } from 'app/utilities/error-helper';
import { ApiCohortResponse } from 'app/models/api-response-models/medco-node/api-cohort-response';

@Injectable()
export class CohortService {

  protected _cohorts: Array<Cohort>
  protected _selectedCohort: Cohort
  protected _selectingCohort: Subject<Cohort>
  protected _nodeName: Array<string>

  protected _isRefreshing: boolean
  public restoring: Subject<boolean>

  constructor(
    protected exploreCohortsService: ExploreCohortsService,
    protected exploreQueryService: ExploreQueryService,
    protected medcoNetworkService: MedcoNetworkService,
    protected constraintService: ConstraintService) {
    this.restoring = new Subject<boolean>()
    this._selectingCohort = new Subject<Cohort>()
    this._nodeName = new Array<string>(this.medcoNetworkService.nodes.length)
    this.medcoNetworkService.nodes.forEach((apiMetadata => {
      this._nodeName[apiMetadata.index] = apiMetadata.name
    }).bind(this))

    this._cohorts = new Array<Cohort>()
  }

  get cohorts() {
    return this._cohorts
  }
  get selectedCohort() {
    return this._selectedCohort
  }
  get selectingCohort(): Observable<Cohort> {
    return this._selectingCohort as Observable<Cohort>
  }
  set selectedCohort(cohort: Cohort) {
    if (this._selectedCohort) {
      this._selectedCohort.selected = false
    }
    this._selectedCohort = cohort
    this._selectedCohort.selected = true
    this._selectingCohort.next(cohort)
  }

  set cohorts(cohorts: Array<Cohort>) {
    this._cohorts = cohorts.map(x => x)
  }
  get isRefreshing(): boolean {
    return this._isRefreshing
  }

  getCohorts() {
    this._isRefreshing = true
    this.exploreCohortsService.getCohortAllNodes().subscribe(
      (apiCohorts => {
        try {
          this.updateCohorts(apiCohortsToCohort(apiCohorts))
        } catch (err) {
          MessageHelper.alert('error', 'An error occured with received saved cohorts', err)
        }
        this._isRefreshing = false
      }).bind(this),
      (err => {
        MessageHelper.alert('error', 'An error occured while retrieving saved cohorts', err)
        this._isRefreshing = false

      }).bind(this),
      (() => {
        MessageHelper.alert('', 'Saved cohorts successfully retrieved')
        this._isRefreshing = false
      }).bind(this)
    )
  }

  postCohort(cohort: Cohort) {
    let apiCohorts = new Array<ApiCohort>()
    this._isRefreshing = true
    let cohortName = cohort.name
    this.medcoNetworkService.nodesUrl.forEach((_, index) => {
      let apiCohort = new ApiCohort()
      apiCohort.patientSetID = cohort.patient_set_id[index]

      apiCohort.creationDate = cohort.updateDate.toISOString()
      apiCohort.updateDate = cohort.updateDate.toISOString()
      apiCohorts.push(apiCohort)
    })

    this.exploreCohortsService.postCohortAllNodes(cohortName, apiCohorts).subscribe(messages => {
      messages.forEach(message => console.log("on post cohort, message: ", message)),
        this.updateCohorts([cohort])
      this._isRefreshing = false
    },
      error => {
        MessageHelper.alert('error', 'An error occured while saving cohort', error)
        this._isRefreshing = false
      })

  }

  updateCohorts(cohorts: Cohort[]) {
    let tmp = new Map<string, Date>()
    this._cohorts.forEach(cohort => { tmp.set(cohort.name, cohort.updateDate) })
    cohorts.forEach(cohort => {
      if (tmp.has(cohort.name)) {
        if (cohort.updateDate > tmp.get(cohort.name)) {
          let i = this._cohorts.findIndex(c => c.name === cohort.name)
          this._cohorts[i] = cohort
        }
      } else {
        this._cohorts.push(cohort)
        tmp.set(cohort.name, cohort.updateDate)
      }
    })

  }

  removeCohorts(cohort: Cohort) {
    this.exploreCohortsService.removeCohortAllNodes(cohort.name).subscribe(
      message => {
        console.log("on remove cohort, message: ", message)
      },
      err => {
        MessageHelper.alert('error', 'An error occured while removing saved cohorts', err)
      }
    )
  }




  // from view to cached

  addCohort(name: string) {

  }

  updateCohortTerms(constraint: CombinationConstraint) {
    this._selectedCohort.rootInclusionConstraint = constraint
  }


  // from cached to view
  restoreTerms(): void {
    this.constraintService.rootInclusionConstraint = this.selectedCohort.rootInclusionConstraint
    this.constraintService.rootExclusionConstraint = this.selectedCohort.rootExclusionConstraint
    this.restoring.next(true)
  }
}

@Injectable()
export class CohortServiceMock extends CohortService {

  constructor(protected exploreCohortsService: ExploreCohortsService, protected exploreQueryService: ExploreQueryService,
    protected medcoNetworkService: MedcoNetworkService, public constraintService: ConstraintService) {
    super(exploreCohortsService, exploreQueryService, medcoNetworkService, constraintService)
  }



}

function apiCohortsToCohort(apiCohorts: ApiCohortResponse[][]): Cohort[] {

  const cohortNumber = apiCohorts[0].length
  apiCohorts
    .forEach(apiCohort => {
      if (apiCohort.length !== cohortNumber) {
        throw ErrorHelper.handleNewError('cohort numbers are not the same across nodes')
      }
    })

  let cohortName, creationDate, updateDate: string
  let res = new Array<Cohort>()
  for (let i = 0; i < cohortNumber; i++) {
    cohortName = apiCohorts[0][i].cohortName
    apiCohorts.forEach(apiCohort => { if (apiCohort[i].cohortName !== cohortName) { throw ErrorHelper.handleNewError('cohort names are not the same across nodes') } })
    creationDate = apiCohorts[0][i].creationDate
    apiCohorts.forEach(apiCohort => { if (apiCohort[i].creationDate !== creationDate) { throw ErrorHelper.handleNewError('cohort creation dates are not the same across nodes') } })
    updateDate = apiCohorts[0][i].updateDate
    apiCohorts.forEach(apiCohort => { if (apiCohort[i].updateDate !== updateDate) { throw ErrorHelper.handleNewError('cohort update dates are not the same across nodes') } })
    let cohort = new Cohort(cohortName, null, null, new Date(creationDate), new Date(updateDate))

    cohort.patient_set_id = apiCohorts.map(apiCohort => apiCohort[i].queryId)
    res.push(cohort)

  }
  return res

}
