/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { CryptoService } from './crypto.service';
import { MedcoNetworkService } from './api/medco-network.service';
import { Observable, of } from 'rxjs';
import { ExploreSearchService } from './api/medco-node/explore-search.service';
import { SurvivalAnalysisService } from './api/medco-node/survival-analysis.service';
import { SurvivalAnalysisClear } from 'app/models/survival-analysis/survival-analysis-clear'
import { ApiSurvivalAnalysis } from 'app/models/api-request-models/survival-analyis/survival-analysis';
import { ApiI2b2Panel } from 'app/models/api-request-models/medco-node/api-i2b2-panel';
import { CohortServiceMock } from './cohort.service';
import { ApiSurvivalAnalysisResponse } from 'app/models/api-response-models/survival-analysis/survival-analysis-response';
import { Granularity } from 'app/models/survival-analysis/granularity-type';
import { Concept } from 'app/models/constraint-models/concept';
import { Constraint } from 'app/models/constraint-models/constraint';
import { NegationConstraint } from 'app/models/constraint-models/negation-constraint';
import { CombinationConstraint } from 'app/models/constraint-models/combination-constraint';
import { ConstraintMappingService } from './constraint-mapping.service';
import { SurvivalSettings } from 'app/models/survival-analysis/survival-settings';
import { ErrorHelper } from 'app/utilities/error-helper';
import { ClearGroup } from 'app/models/survival-analysis/clear-group';

export type SubGroup = { name: string, rootInclusionConstraint: CombinationConstraint, rootExclusionConstraint: CombinationConstraint }

@Injectable()
export class SurvivalService {
  protected _id: string
  protected _patientGroupIds: Map<string, number[]> // one string[] per node
  protected _granularity = Granularity.day
  protected _limit = 2000
  protected _startConcept: Concept
  protected _endConcept: Concept
  protected _startModifier = '@'
  protected _endModifier = '@'
  protected _subGroups = new Array<SubGroup>()

  set granularity(gran: Granularity) {
    this._granularity = gran
  }

  get granularity(): Granularity {
    return this._granularity
  }

  set limit(lim: number) {
    this._limit = lim
  }

  get limit(): number {
    return this._limit
  }

  set startConcept(c: Concept) {
    this._startConcept = c
  }
  get startConcept(): Concept {
    return this._startConcept
  }
  set endConcept(c: Concept) {
    this._endConcept = c
  }
  get endConcept(): Concept {
    return this._endConcept
  }

  set startModifier(mod: string) {
    this._startModifier = mod
  }

  get startModifier(): string {
    return this._startModifier
  }

  set endModifier(mod: string) {
    this._endModifier = mod
  }

  get endModifier(): string {
    return this._endModifier
  }

  set subGroups(sg: SubGroup[]) {
    this._subGroups = sg
  }

  get subGroups(): SubGroup[] {
    return this._subGroups
  }


  constructor(protected authService: AuthenticationService,
    protected cryptoService: CryptoService,
    protected medcoNetworkService: MedcoNetworkService,
    protected exploreSearchService: ExploreSearchService,
    protected apiSurvivalAnalysisService: SurvivalAnalysisService,
    protected cohortService: CohortServiceMock,
    protected constraintMappingService: ConstraintMappingService) {
    this._patientGroupIds = new Map<string, number[]>()
    medcoNetworkService.nodes.forEach((apiNodeMetadata => { this._patientGroupIds[apiNodeMetadata.name] = new Array<string>() }
    ).bind(this))


  }


  generatePanels(subGroup: SubGroup): ApiI2b2Panel[] {
    let constraint: Constraint
    if (!subGroup.rootInclusionConstraint && !subGroup.rootExclusionConstraint) {
      return null
    }
    if (subGroup.rootInclusionConstraint && !subGroup.rootExclusionConstraint) {
      constraint = subGroup.rootInclusionConstraint
    }
    if (!subGroup.rootInclusionConstraint && subGroup.rootExclusionConstraint) {
      constraint = new NegationConstraint(subGroup.rootExclusionConstraint)
    } else {
      constraint = new CombinationConstraint();
      (constraint as CombinationConstraint).addChild(subGroup.rootInclusionConstraint);
      (constraint as CombinationConstraint).addChild(new NegationConstraint(subGroup.rootExclusionConstraint))
    }

    return this.constraintMappingService.mapConstraint(constraint)
  }

  runSurvivalAnalysis(): Observable<ApiSurvivalAnalysisResponse[]> {
    let apiSurvivalAnalysis = new ApiSurvivalAnalysis()
    let d = new Date()
    apiSurvivalAnalysis.ID = `MedCo_Explore_Query_${d.getUTCFullYear()}${d.getUTCMonth()}${d.getUTCDate()}${d.getUTCHours()}` +
      `${d.getUTCMinutes()}${d.getUTCSeconds()}${d.getUTCMilliseconds()}`
    if (!this.startConcept) {
      throw ErrorHelper.handleNewError('Start event is undefined')

    }
    apiSurvivalAnalysis.startConcept = this.startConcept.path
    apiSurvivalAnalysis.startModifier = this.startModifier

    if (!this.endConcept) {
      throw ErrorHelper.handleNewError('End event is undefined')
    }
    apiSurvivalAnalysis.endConcept = this.endConcept.path
    apiSurvivalAnalysis.endModifier = this.endModifier

    apiSurvivalAnalysis.timeLimit = this.limit
    apiSurvivalAnalysis.timeGranularity = this.granularity
    if (!this.granularity) {
      throw ErrorHelper.handleNewError('Granularity is undefined')
    }
    apiSurvivalAnalysis.cohortName = this.cohortService.selectedCohort.name
    apiSurvivalAnalysis.subGroupDefinitions = this.subGroups.map(sg => { return { groupName: sg.name, panels: this.generatePanels(sg) } })



    console.log('selected cohort from cohort service', this.cohortService.selectedCohort)
    return this.apiSurvivalAnalysisService.survivalAnalysisAllNodes(apiSurvivalAnalysis)
  }

  survivalAnalysisDecrypt(survivalAnalysisResponse: ApiSurvivalAnalysisResponse): SurvivalAnalysisClear {
    let start = performance.now()
    let res = new SurvivalAnalysisClear()
    let nofDecryptions = 0
    res.results = survivalAnalysisResponse.results.map(group => {
      let newGroup = new ClearGroup()

      newGroup.groupId = group.groupID
      newGroup.groupResults = new Array<{
        events: {
          censoringEvent: number;
          eventOfInterest: number;
        };
        timepoint: number;
      }>()

      newGroup.initialCount = this.cryptoService.decryptIntegerWithEphemeralKey(group.initialCount)
      nofDecryptions++

      for (let i = 0; i < group.groupResults.length; i++) {
        let eventOfInterest = this.cryptoService.decryptIntegerWithEphemeralKey(group.groupResults[i].events.eventofinterest)
        let censoringEvent = this.cryptoService.decryptIntegerWithEphemeralKey(group.groupResults[i].events.censoringevent)
        nofDecryptions += 2
        if (eventOfInterest === 0 && censoringEvent === 0) {
          continue
        }
        newGroup.groupResults.push({
          timepoint: group.groupResults[i].timepoint,
          events: {
            eventOfInterest: eventOfInterest,
            censoringEvent: censoringEvent
          }
        })

      }



      return newGroup

    })

    let end = performance.now()
    console.log('survival result', res.results)

    console.log(`${nofDecryptions} ElGamal points decrypted in ${end - start} milliseconds`)

    return res
  }

  settings(): SurvivalSettings {

    let subGroupsTextualRepresentations = this._subGroups.map(sg => {
      return {
        groupId: sg.name,
        rootInclusionConstraint: sg.rootInclusionConstraint ? sg.rootInclusionConstraint.textRepresentation : null,
        rootExclusionConstraint: sg.rootExclusionConstraint ? sg.rootExclusionConstraint.textRepresentation : null
      }
    })
    return new SurvivalSettings(
      this._granularity,
      this._limit,
      this._startConcept.name,
      this._startModifier,
      this._endConcept.name,
      this._endModifier,
      subGroupsTextualRepresentations,
    )
  }
}