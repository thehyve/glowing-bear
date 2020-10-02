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
import { ApiSurvivalAnalysisResponse } from 'app/models/api-request-models/survival-analyis/survival-analysis-response';
import { Granularity } from 'app/models/survival-analysis/granularity-type';
import { Concept } from 'app/models/constraint-models/concept';
import { Constraint } from 'app/models/constraint-models/constraint';
import { NegationConstraint } from 'app/models/constraint-models/negation-constraint';
import { CombinationConstraint } from 'app/models/constraint-models/combination-constraint';
import { ConstraintMappingService } from './constraint-mapping.service';
import { SurvivalSettings } from 'app/models/survival-analysis/survival-settings';

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
      throw new Error('Start event is undefined')

    }
    apiSurvivalAnalysis.startConcept = this.startConcept.path
    apiSurvivalAnalysis.startModifier = this.startModifier

    if (!this.endConcept) {
      throw new Error('End event is undefined')
    }
    apiSurvivalAnalysis.endConcept = this.endConcept.path
    apiSurvivalAnalysis.endModifier = this.endModifier

    apiSurvivalAnalysis.timeLimit = this.limit
    apiSurvivalAnalysis.timeGranularity = this.granularity
    if (!this.granularity) {
      throw new Error('Granularity is undefined')
    }
    apiSurvivalAnalysis.setID = -1
    apiSurvivalAnalysis.subGroupDefinitions = this.subGroups.map(sg => { return { cohortName: sg.name, panels: this.generatePanels(sg) } })



    console.log('cohortService', this.cohortService.selectedCohort)
    return this.apiSurvivalAnalysisService.survivalAnalysisAllNodes(apiSurvivalAnalysis, this.cohortService.selectedCohort.patient_set_id)
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

class ClearGroup {
  groupId: string;
  initialCount: number;
  groupResults: {
    events: {
      censoringEvent: number;
      eventOfInterest: number;
    };
    timepoint: number;
  }[];
}

class ClearGroupResult {
  timepoint: number;
  events: {
    eventOfInterest: number;
    censoringEvent: number;
  }
}

@Injectable()
export class SurvivalAnalysisServiceMock extends SurvivalService {

  constructor(protected authService: AuthenticationService,
    protected cryptoService: CryptoService,
    protected medcoNetworkService: MedcoNetworkService,
    protected exploreSearchService: ExploreSearchService,
    protected apiSurvivalAnalysisService: SurvivalAnalysisService,
    protected cohortService: CohortServiceMock,
    protected constraintMappingService: ConstraintMappingService) {
    super(
      authService,
      cryptoService,
      medcoNetworkService,
      exploreSearchService,
      apiSurvivalAnalysisService,
      cohortService,
      constraintMappingService
    )
  }

  retrievedEncIDs(): Observable<{ name: string, encID?: number }[]> {
    return of([{ name: '1', encId: 1 },
    { name: '2', encId: 2 },
    { name: '3', encId: 3 },
    { name: '4', encId: 4 },
    { name: '5', encId: 5 },
    { name: '6', encId: 6 },
    { name: '7', encId: 7 },
    { name: '8', encId: 8 },
    { name: '9', encId: 9 }])
  }


  execute(): Observable<SurvivalAnalysisClear> {

    let srva = new SurvivalAnalysisClear()
    /*
    srva.results=[{groupId:'0',
    initialCount:100,
    groupResults:[
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:1},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:2},
      {events:{censoringEvent:7,eventOfInterest:4},
      timepoint:3},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:4},
      {events:{censoringEvent:5,eventOfInterest:4},
      timepoint:5},
      {events:{censoringEvent:1,eventOfInterest:4},
      timepoint:6},
      {events:{censoringEvent:1,eventOfInterest:4},
      timepoint:7},
      {events:{censoringEvent:1,eventOfInterest:4},
      timepoint:8},
      {events:{censoringEvent:1,eventOfInterest:4},
      timepoint:9},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:10},

    ]
  },
  {groupId:'1',
  initialCount:100,
  groupResults:[
    {events:{censoringEvent:2,eventOfInterest:4},
    timepoint:1},
    {events:{censoringEvent:2,eventOfInterest:4},
    timepoint:2},
    {events:{censoringEvent:2,eventOfInterest:4},
    timepoint:3},
    {events:{censoringEvent:2,eventOfInterest:4},
    timepoint:4},
    {events:{censoringEvent:2,eventOfInterest:8},
    timepoint:5},
    {events:{censoringEvent:2,eventOfInterest:4},
    timepoint:6},
    {events:{censoringEvent:2,eventOfInterest:7},
    timepoint:7},
    {events:{censoringEvent:2,eventOfInterest:4},
    timepoint:8},
    {events:{censoringEvent:2,eventOfInterest:4},
    timepoint:9},
    {events:{censoringEvent:2,eventOfInterest:4},
    timepoint:10},

  ]
},
{groupId:'2',
initialCount:100,
groupResults:[
  {events:{censoringEvent:2,eventOfInterest:4},
  timepoint:1},
  {events:{censoringEvent:1,eventOfInterest:4},
  timepoint:2},
  {events:{censoringEvent:2,eventOfInterest:4},
  timepoint:3},
  {events:{censoringEvent:2,eventOfInterest:4},
  timepoint:4},
  {events:{censoringEvent:2,eventOfInterest:1},
  timepoint:5},
  {events:{censoringEvent:2,eventOfInterest:4},
  timepoint:6},
  {events:{censoringEvent:2,eventOfInterest:4},
  timepoint:7},
  {events:{censoringEvent:2,eventOfInterest:4},
  timepoint:8},
  {events:{censoringEvent:1,eventOfInterest:1},
  timepoint:9},
  {events:{censoringEvent:2,eventOfInterest:4},
  timepoint:10},

]
},
{groupId:'3',
initialCount:100,
    groupResults:[
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:1},
      {events:{censoringEvent:1,eventOfInterest:8},
      timepoint:2},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:3},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:4},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:5},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:6},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:7},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:8},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:9},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:10},

    ]
  }]
  */
    srva.results = [
      {
        groupId: '1',
        initialCount: 138,
        groupResults: lungGroup1,
      }, {
        groupId: '2',
        initialCount: 90,
        groupResults: lungGroup2,
      }
    ]
    return of(srva)

  }

}

// lungTest
let lungGroup2 = [
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 5 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 60 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 61 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 62 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 79 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 81 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 92 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 95 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 105 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 107 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 122 },
  { events: { censoringEvent: 0, eventOfInterest: 2 }, timepoint: 145 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 153 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 166 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 167 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 173 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 175 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 177 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 182 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 186 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 192 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 194 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 199 },
  { events: { censoringEvent: 0, eventOfInterest: 2 }, timepoint: 201 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 202 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 203 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 208 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 211 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 224 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 226 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 235 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 239 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 240 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 243 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 245 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 252 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 266 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 268 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 269 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 272 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 276 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 285 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 292 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 293 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 296 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 305 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 310 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 315 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 332 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 340 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 345 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 348 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 350 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 351 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 356 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 361 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 363 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 364 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 371 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 376 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 382 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 384 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 426 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 433 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 444 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 450 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 473 },
  { events: { censoringEvent: 2, eventOfInterest: 0 }, timepoint: 511 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 520 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 524 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 529 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 543 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 550 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 551 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 559 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 588 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 641 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 654 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 687 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 705 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 728 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 731 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 735 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 740 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 765 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 821 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 965 },
]

let lungGroup1 = [
  { events: { censoringEvent: 0, eventOfInterest: 3 }, timepoint: 11 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 12 },
  { events: { censoringEvent: 0, eventOfInterest: 2 }, timepoint: 13 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 15 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 26 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 30 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 31 },
  { events: { censoringEvent: 0, eventOfInterest: 2 }, timepoint: 53 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 54 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 59 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 60 },
  { events: { censoringEvent: 0, eventOfInterest: 2 }, timepoint: 65 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 71 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 81 },
  { events: { censoringEvent: 0, eventOfInterest: 2 }, timepoint: 88 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 92 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 93 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 95 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 105 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 107 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 110 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 116 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 118 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 131 },
  { events: { censoringEvent: 0, eventOfInterest: 2 }, timepoint: 132 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 135 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 142 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 144 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 147 },
  { events: { censoringEvent: 0, eventOfInterest: 2 }, timepoint: 156 },
  { events: { censoringEvent: 0, eventOfInterest: 3 }, timepoint: 163 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 166 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 170 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 174 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 175 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 176 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 177 },
  { events: { censoringEvent: 0, eventOfInterest: 2 }, timepoint: 179 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 180 },
  { events: { censoringEvent: 0, eventOfInterest: 2 }, timepoint: 181 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 183 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 185 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 188 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 189 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 191 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 196 },
  { events: { censoringEvent: 1, eventOfInterest: 1 }, timepoint: 197 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 202 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 207 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 210 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 212 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 218 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 221 },
  { events: { censoringEvent: 1, eventOfInterest: 1 }, timepoint: 222 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 223 },
  { events: { censoringEvent: 2, eventOfInterest: 0 }, timepoint: 225 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 229 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 230 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 237 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 239 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 246 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 259 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 267 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 269 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 270 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 279 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 283 },
  { events: { censoringEvent: 1, eventOfInterest: 1 }, timepoint: 284 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 285 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 286 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 288 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 291 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 292 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 300 },
  { events: { censoringEvent: 1, eventOfInterest: 1 }, timepoint: 301 },
  { events: { censoringEvent: 1, eventOfInterest: 1 }, timepoint: 303 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 306 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 310 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 320 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 329 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 337 },
  { events: { censoringEvent: 0, eventOfInterest: 2 }, timepoint: 353 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 363 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 364 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 371 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 387 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 390 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 394 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 404 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 413 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 428 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 429 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 442 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 444 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 455 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 457 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 458 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 460 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 477 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 519 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 524 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 533 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 558 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 567 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 574 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 583 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 613 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 624 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 643 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 655 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 689 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 707 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 791 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 806 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 814 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 840 },
  { events: { censoringEvent: 0, eventOfInterest: 1 }, timepoint: 883 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 1010 },
  { events: { censoringEvent: 1, eventOfInterest: 0 }, timepoint: 1022 },
]
