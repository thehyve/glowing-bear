/**
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Injectable } from '@angular/core';
import { Cohort } from 'app/models/cohort-models/cohort';
import { Observable, Subject } from 'rxjs';
import { ExploreQueryService } from './api/medco-node/explore-query.service';
import { MedcoNetworkService } from './api/medco-network.service';
import { CombinationConstraint } from 'app/models/constraint-models/combination-constraint';
import { ConstraintService } from './constraint.service';
import { ExploreCohortsService } from './api/medco-node/explore-cohorts.service';
import { MessageHelper } from 'app/utilities/message-helper';
import { ApiCohort } from 'app/models/api-request-models/medco-node/api-cohort';
import { ErrorHelper } from 'app/utilities/error-helper';
import { ApiCohortResponse } from 'app/models/api-response-models/medco-node/api-cohort-response';
import { ConstraintReverseMappingService } from './constraint-reverse-mapping.service';
import { ApiI2b2Timing } from 'app/models/api-request-models/medco-node/api-i2b2-timing';
import { Constraint } from 'app/models/constraint-models/constraint';
import { ConceptConstraint } from 'app/models/constraint-models/concept-constraint';
import { HttpErrorResponse } from '@angular/common/http';
import { CombinationState } from 'app/models/constraint-models/combination-state';

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

      let cohort = new Cohort(cohortName, null, null, creationDates, updateDates)

      cohort.patient_set_id = apiCohorts.map(apiCohort => apiCohort[i].queryId)
      cohort.queryDefinition = apiCohorts.map(apiCohort => apiCohort[i].queryDefinition)
      res.push(cohort)

    }
    return res

  }

  /**
   * conformContraints handles constraint(s) in a way they fit in the explore component,
   * which has one panel for inclusion, one for exclusion
   *
   * @param nots input inclusion/exclusion from I2B2 panels
   * @param constraintArg input constraint(s)
   * @param inclusionConstraint output inclusion constraint
   * @param exclusionConstraint output exclusion constraint
   */
  private static conformConstraints(
    nots: boolean[],
    constraintArg: Constraint,
    target: { inclusionConstraint: Constraint, exclusionConstraint: Constraint }): void {
    target.inclusionConstraint = null
    target.exclusionConstraint = null

    if (nots.length === 0) {
      return
    }

    let sameValues = nots.every(value => value === nots[0])
    if (sameValues) {
      if (nots[0]) {
        target.exclusionConstraint = constraintArg
      } else {
        target.inclusionConstraint = constraintArg
      }
      return

    } else {
      if (!(constraintArg instanceof CombinationConstraint)) {
        ErrorHelper.handleNewError('Unexpected error in restore cohort: multiple and distinct negation flags for a constraint that is not a combination.')
      }
      let panels = (constraintArg as CombinationConstraint).children;
      if (nots.length !== panels.length) {
        ErrorHelper.handleNewError(`Unexpected error in restore cohort: the number of negation flags (${nots.length}) is not equal to that of panels (${panels.length})`)
      } else {
        target.inclusionConstraint = new CombinationConstraint()
        target.exclusionConstraint = new CombinationConstraint()
        panels.forEach((child, index) => {
          if (nots[index]) {
            (target.exclusionConstraint as CombinationConstraint).addChild(child)
          } else {
            (target.inclusionConstraint as CombinationConstraint).addChild(child)
          }
        })
      }
    }
  }

  /**
   * unflattenConstraints check if the root exclusion and inclusion constraint are made of a simple concept constraint,
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
      newCombination.addChild(newLevel2Combination)
      return newCombination

    }
    let newAndCombination = flatConstraint.clone()
    for (let i = 0; i < (flatConstraint as CombinationConstraint).children.length; i++) {
      const childConstraint = (flatConstraint as CombinationConstraint).children[i]
      if (childConstraint instanceof ConceptConstraint) {
        let newConstraint = new CombinationConstraint()
        newConstraint.combinationState = CombinationState.Or
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
        this._selectedCohort = null
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

  getCohorts() {
    this._isRefreshing = true
    this.exploreCohortsService.getCohortAllNodes().subscribe(
      (apiCohorts => {
        try {
          this.updateCohorts(CohortService.apiCohortsToCohort(apiCohorts))
        } catch (err) {
          MessageHelper.alert('error', 'An error occured with received saved cohorts', (err as Error).message)
        }
        this._isRefreshing = false
      }).bind(this),
      (err => {
        MessageHelper.alert('error', 'An error occured while retrieving saved cohorts', (err as HttpErrorResponse).error.message)
        this._isRefreshing = false

      }).bind(this),
      (() => {
        MessageHelper.alert('success', 'Saved cohorts successfully retrieved')
        this._isRefreshing = false
      }).bind(this)
    )
  }

  postCohort(cohort: Cohort) {
    let apiCohorts = new Array<ApiCohort>()
    this._isRefreshing = true
    let cohortName = cohort.name
    this.medcoNetworkService.nodes.forEach((_, index) => {
      let apiCohort = new ApiCohort()
      apiCohort.patientSetID = cohort.patient_set_id[index]

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
        if (newCohort.lastUpdateDate() >= tmp.get(newCohort.name)) {
          let i = this._cohorts.findIndex(c => c.name === newCohort.name)
          this._cohorts[i] = newCohort
        } else {
          MessageHelper.alert('warn', `New version of cohort ${newCohort.name} was skipped for update because its update date is less recent than the one of existing cohort`)
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
    this._selectedCohort.rootInclusionConstraint = constraint
  }


  // from cached to view
  restoreTerms(cohors: Cohort): void {

    let cohortDefinition = cohors.mostRecentQueryDefinition()
    if (!cohortDefinition) {
      MessageHelper.alert('warn', `Definition not found for cohort ${cohors.name}`)
      return
    }
    let nots = cohortDefinition.panels.map(({ not }) => not)
    this._queryTiming.next(cohortDefinition.queryTiming)

    this.constraintReverseMappingService.mapPanels(cohortDefinition.panels)
      .subscribe(constraint => {
        let formatedConstraint = {
          inclusionConstraint: <Constraint>{},
          exclusionConstraint: <Constraint>{}
        }
        CohortService.conformConstraints(nots, constraint, formatedConstraint)
        formatedConstraint.inclusionConstraint = CohortService.unflattenConstraints(formatedConstraint.inclusionConstraint)
        formatedConstraint.exclusionConstraint = CohortService.unflattenConstraints(formatedConstraint.exclusionConstraint)

        if ((formatedConstraint.inclusionConstraint) || (formatedConstraint.exclusionConstraint)) {
          this.constraintService.rootInclusionConstraint = new CombinationConstraint()
          this.constraintService.rootInclusionConstraint.isRoot = true
          this.constraintService.rootExclusionConstraint = new CombinationConstraint()
          this.constraintService.rootExclusionConstraint.isRoot = true
        }
        if (formatedConstraint.inclusionConstraint) {
          if (formatedConstraint.inclusionConstraint instanceof ConceptConstraint) {
            this.constraintService.rootInclusionConstraint.addChild(formatedConstraint.inclusionConstraint)
          } else {
            this.constraintService.rootInclusionConstraint = (formatedConstraint.inclusionConstraint as CombinationConstraint);
            this.constraintService.rootInclusionConstraint.isRoot = true
          }
        }
        if (formatedConstraint.exclusionConstraint) {
          if (formatedConstraint.exclusionConstraint instanceof ConceptConstraint) {
            this.constraintService.rootExclusionConstraint.addChild(formatedConstraint.exclusionConstraint)
          } else {
            this.constraintService.rootExclusionConstraint = (formatedConstraint.exclusionConstraint as CombinationConstraint);
            this.constraintService.rootExclusionConstraint.isRoot = true
          }
        }
      })
    this.restoring.next(true)
  }
}
