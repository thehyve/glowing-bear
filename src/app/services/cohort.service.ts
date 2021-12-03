/**
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ExploreQueryService } from './api/medco-node/explore-query.service';
import { MedcoNetworkService } from './api/medco-network.service';
import { ConstraintService } from './constraint.service';
import { ExploreCohortsService } from './api/medco-node/explore-cohorts.service';
import { ConstraintReverseMappingService } from './constraint-reverse-mapping.service';
import { MessageHelper } from '../utilities/message-helper';
import { ConceptConstraint } from '../models/constraint-models/concept-constraint';
import { Cohort } from '../models/cohort-models/cohort';
import { Constraint } from '../models/constraint-models/constraint';
import { ApiI2b2Timing } from '../models/api-request-models/medco-node/api-i2b2-timing';
import { ApiCohortResponse } from '../models/api-response-models/medco-node/api-cohort-response';
import { CombinationState } from '../models/constraint-models/combination-state';
import { CombinationConstraint } from '../models/constraint-models/combination-constraint';
import { ApiCohort } from '../models/api-request-models/medco-node/api-cohort';
import { ErrorHelper } from '../utilities/error-helper';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class CohortService {

  private _cohorts: Array<Cohort>
  private _selectedCohort: Cohort
  private _nodeName: Array<string>

  private _isRefreshing: boolean

  // internal states of the explore component handling cohorts
  _cohortName: string
  _lastSuccessfulSet: number[]

  // term restoration
  public restoring: Subject<boolean>
  private _queryTiming: Subject<ApiI2b2Timing>
  private _panelTimings: Subject<ApiI2b2Timing[]>

  // constraint on cohort name
  _patternValidation: RegExp


  private static apiCohortsToCohort(apiCohorts: ApiCohortResponse[][]): Cohort[] {

    const cohortNumber = apiCohorts[0].length
    apiCohorts
      .forEach(apiCohort => {
        if (apiCohort.length !== cohortNumber) {
          throw ErrorHelper.handleNewError('cohort numbers are not the same across nodes')
        }
      })

    let cohortName: string
    let creationDate: string
    let updateDate: string

    let res = new Array<Cohort>()
    for (let i = 0; i < cohortNumber; i++) {
      let creationDates = new Array<Date>()
      let updateDates = new Array<Date>()

      cohortName = apiCohorts[0][i].cohortName
      apiCohorts.forEach(apiCohort => {
        if (apiCohort[i].cohortName !== cohortName) {
          throw ErrorHelper.handleNewError('Cohort names are not the same across nodes')
        }
      })
      creationDate = apiCohorts[0][i].creationDate
      apiCohorts.forEach(apiCohort => {
        if (apiCohort[i].creationDate !== creationDate) {
          MessageHelper.alert('warn', 'Cohort creation dates are not the same across nodes')
        }
        creationDates.push(new Date(apiCohort[i].creationDate))
      })
      updateDate = apiCohorts[0][i].updateDate
      apiCohorts.forEach(apiCohort => {
        if (apiCohort[i].updateDate !== updateDate) {
          MessageHelper.alert('warn', 'cohort update dates are not the same across nodes')
        }
        updateDates.push(new Date(apiCohort[i].updateDate))
      })

      let cohort = new Cohort(cohortName, null, creationDates, updateDates)

      cohort.patient_set_id = apiCohorts.map(apiCohort => apiCohort[i].queryID)
      cohort.queryDefinition = apiCohorts.map(apiCohort => apiCohort[i].queryDefinition)
      res.push(cohort)

    }
    return res

  }

  /**
   * unflattenConstraints check if the root constraints are made of a simple concept constraint,
   * or AND-composed consrtaints. If it is the case, it unflattens them into AND-composed OR-composed combinations
   *
   * @param flatConstraint
   * @returns {Constraint}
   *
   */
  private static unflattenConstraints(flatConstraint: Constraint): Constraint {
    if (!(flatConstraint)) {
      return null
    }
    if (!(flatConstraint instanceof CombinationConstraint)) {
      let newCombination = new CombinationConstraint()
      newCombination.combinationState = CombinationState.And
      newCombination.panelTimingSameInstance = flatConstraint.panelTimingSameInstance
      let newLevel2Combination = new CombinationConstraint()
      newLevel2Combination.combinationState = CombinationState.Or
      newLevel2Combination.addChild(flatConstraint)
      newLevel2Combination.excluded = flatConstraint.excluded
      newCombination.addChild(newLevel2Combination)
      return newCombination

    }
    let newAndCombination = flatConstraint.clone()
    for (let i = 0; i < (flatConstraint as CombinationConstraint).children.length; i++) {
      const childConstraint = (flatConstraint as CombinationConstraint).children[i]
      if (childConstraint instanceof ConceptConstraint) {
        let newConstraint = new CombinationConstraint()
        newConstraint.combinationState = CombinationState.Or
        newConstraint.excluded = childConstraint.excluded
        newConstraint.panelTimingSameInstance = childConstraint.panelTimingSameInstance;
        newConstraint.addChild((newAndCombination as CombinationConstraint).children[i]);
        (newAndCombination as CombinationConstraint).updateChild(i, newConstraint)
      }
    }

    return newAndCombination

  }

  constructor(
    private exploreCohortsService: ExploreCohortsService,
    private exploreQueryService: ExploreQueryService,
    private medcoNetworkService: MedcoNetworkService,
    private constraintService: ConstraintService,
    private constraintReverseMappingService: ConstraintReverseMappingService) {
    this.restoring = new Subject<boolean>()
    this._queryTiming = new Subject<ApiI2b2Timing>()
    this._panelTimings = new Subject<ApiI2b2Timing[]>()
    this._nodeName = new Array<string>(this.medcoNetworkService.nodes.length)
    this.medcoNetworkService.nodes.forEach((apiMetadata => {
      this._nodeName[apiMetadata.index] = apiMetadata.name
    }).bind(this))
    this._patternValidation = new RegExp('^\\w+$')
    this._cohorts = new Array<Cohort>()
  }

  get cohorts() {
    return this._cohorts
  }
  get selectedCohort() {
    return this._selectedCohort
  }
  set selectedCohort(cohort: Cohort) {
    if (this._selectedCohort) {
      this._selectedCohort.selected = false

      if (this._selectedCohort === cohort) {
        this._selectedCohort = undefined
        return
      }

    }
    this._selectedCohort = cohort
    if (cohort) {
      this._selectedCohort.selected = true
    }
  }

  set cohorts(cohorts: Array<Cohort>) {
    this._cohorts = cohorts.map(x => x)
  }
  get isRefreshing(): boolean {
    return this._isRefreshing
  }

  set lastSuccessfulSet(setIDs: number[]) {
    this._lastSuccessfulSet = setIDs
  }

  get lastSuccessfulSet(): number[] {
    return this._lastSuccessfulSet
  }

  set cohortName(name: string) {
    this._cohortName = name
  }

  get cohortName(): string {
    return this._cohortName
  }

  get queryTiming(): Observable<ApiI2b2Timing> {
    return this._queryTiming.asObservable()
  }

  get panelTimings(): Observable<ApiI2b2Timing[]> {
    return this._panelTimings.asObservable()
  }

  get patternValidation(): RegExp {
    return this._patternValidation
  }

  getCohorts() {
    this._isRefreshing = true
    this.exploreCohortsService.getCohortAllNodes().subscribe({
      next: (apiCohorts => {
        try {
          this.updateCohorts(CohortService.apiCohortsToCohort(apiCohorts))
        } catch (err) {
          MessageHelper.alert('error', 'An error occured with received saved cohorts', (err as Error).message)
        }
        this._isRefreshing = false
      }).bind(this),
      error: (err => {
        MessageHelper.alert('error', 'An error occured while retrieving saved cohorts', (err as HttpErrorResponse).error.message)
        this._isRefreshing = false

      }).bind(this),
      complete: (() => {
        MessageHelper.alert('success', 'Saved cohorts successfully retrieved')
        this._isRefreshing = false
      }).bind(this)
    })
  }

  postCohort(cohort: Cohort) {
    let apiCohorts = new Array<ApiCohort>()
    this._isRefreshing = true
    let cohortName = cohort.name
    this.medcoNetworkService.nodes.forEach((_, index) => {
      let apiCohort = new ApiCohort()
      apiCohort.queryID = cohort.patient_set_id[index]

      apiCohort.creationDate = cohort.updateDate[index].toISOString()
      apiCohort.updateDate = cohort.updateDate[index].toISOString()
      apiCohorts.push(apiCohort)
    })

    this.exploreCohortsService.postCohortAllNodes(cohortName, apiCohorts).subscribe(messages => {
      messages.forEach(message => console.log('on post cohort, message: ', message)),
        this.updateCohorts([cohort])
      this._isRefreshing = false
    },
      error => {
        MessageHelper.alert('error', 'An error occured while saving cohort', (error as HttpErrorResponse).error.message)
        this._isRefreshing = false
      })

  }

  updateCohorts(cohorts: Cohort[]) {
    let tmp = new Map<string, Date>()
    this._cohorts.forEach(cohort => {
      tmp.set(cohort.name, cohort.lastUpdateDate())
    })
    cohorts.forEach(newCohort => {
      if (tmp.has(newCohort.name)) {
        const localDate = tmp.get(newCohort.name)
        const remoteDate = newCohort.lastUpdateDate()
        if (remoteDate >= localDate) {
          let i = this._cohorts.findIndex(c => c.name === newCohort.name)
          this._cohorts[i] = newCohort
        } else {
          MessageHelper.alert('warn', `New version of cohort ${newCohort.name} was skipped for update because its update date is less recent than the one of existing cohort: ` +
            `local version date: ${localDate.toISOString()}, remote version ${remoteDate.toISOString()}`)
        }
      } else {
        this._cohorts.push(newCohort)
        tmp.set(newCohort.name, newCohort.lastUpdateDate())
      }
    })

  }

  removeCohorts(cohort: Cohort) {
    this.exploreCohortsService.removeCohortAllNodes(cohort.name).subscribe(
      message => {
        console.log('on remove cohort, message: ', message)
      },
      err => {
        MessageHelper.alert('error', 'An error occured while removing saved cohorts', (err as HttpErrorResponse).error.message)
      }
    )
  }




  // from view to cached

  addCohort(name: string) {

  }

  updateCohortTerms(constraint: CombinationConstraint) {
    this._selectedCohort.rootConstraint = constraint
  }


  // from cached to view
  restoreTerms(cohors: Cohort): void {

    let cohortDefinition = cohors.mostRecentQueryDefinition()
    if (!cohortDefinition) {
      MessageHelper.alert('warn', `Definition not found for cohort ${cohors.name}`)
      return
    }

    this._queryTiming.next(cohortDefinition.queryTiming)
    this.constraintReverseMappingService.mapPanels(cohortDefinition.panels)
      .subscribe(constraint => {
        constraint = CohortService.unflattenConstraints(constraint)
        if (constraint) {
          if (constraint instanceof ConceptConstraint) {
            this.constraintService.rootConstraint.addChild(constraint)
          } else {
            this.constraintService.rootConstraint = (constraint as CombinationConstraint);
            this.constraintService.rootConstraint.isRoot = true
          }
        }
      })
    this.restoring.next(true)
  }
}
