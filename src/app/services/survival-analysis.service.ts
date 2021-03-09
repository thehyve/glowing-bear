/**
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { CryptoService } from './crypto.service';
import { MedcoNetworkService } from './api/medco-network.service';
import {forkJoin, Observable, of} from 'rxjs';
import { ExploreSearchService } from './api/medco-node/explore-search.service';
import { ApiSurvivalAnalysisService } from './api/medco-node/api-survival-analysis.service';
import { CohortService } from './cohort.service';
import {Concept} from '../models/constraint-models/concept';
import {ApiI2b2Panel} from '../models/api-request-models/medco-node/api-i2b2-panel';
import {ClearGroup} from '../models/survival-analysis/clear-group';
import {ApiSurvivalAnalysisResponse} from '../models/api-response-models/survival-analysis/survival-analysis-response';
import {Constraint} from '../models/constraint-models/constraint';
import {SurvivalAnalysisClear} from '../models/survival-analysis/survival-analysis-clear';
import {Granularity} from '../models/survival-analysis/granularity-type';
import {NegationConstraint} from '../models/constraint-models/negation-constraint';
import {ErrorHelper} from '../utilities/error-helper';
import {ConstraintMappingService} from './constraint-mapping.service';
import {When} from '../models/survival-analysis/when-type';
import {SurvivalSettings} from '../models/survival-analysis/survival-settings';
import {ApiSurvivalAnalysis} from '../models/api-request-models/survival-analyis/api-survival-analysis';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {map} from 'rxjs/operators';

export class SubGroup {
  name: string
  rootInclusionConstraint: CombinationConstraint
  rootExclusionConstraint: CombinationConstraint
}

@Injectable()
export class SurvivalService {
  private _id: string
  private _patientGroupIds: Map<string, number[]> // one string[] per node
  private _granularity = Granularity.day
  private _limit = 2000
  private _startConcept: Concept
  private _endConcept: Concept
  private _startModifier = '@'
  private _endModifier = '@'
  private _startsWhen = When.earliest
  private _endsWhen = When.earliest
  private _subGroups = new Array<SubGroup>()

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

  set startsWhen(when: When) {
    this._startsWhen = when

  }
  get startsWhen(): When {
    return this._startsWhen
  }

  set endsWhen(when: When) {
    this._endsWhen = when

  }
  get endsWhen(): When {
    return this._endsWhen
  }

  set subGroups(sg: SubGroup[]) {
    this._subGroups = sg
  }

  get subGroups(): SubGroup[] {
    return this._subGroups
  }


  constructor(private authService: AuthenticationService,
    private cryptoService: CryptoService,
    private medcoNetworkService: MedcoNetworkService,
    private exploreSearchService: ExploreSearchService,
    private apiSurvivalAnalysisService: ApiSurvivalAnalysisService,
    private cohortService: CohortService,
    private constraintMappingService: ConstraintMappingService) {
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
    apiSurvivalAnalysis.ID = `MedCo_Survival_Analysis_${d.getUTCFullYear()}${d.getUTCMonth()}${d.getUTCDate()}${d.getUTCHours()}` +
      `${d.getUTCMinutes()}${d.getUTCSeconds()}${d.getUTCMilliseconds()}`
    if (!this.startConcept) {
      throw ErrorHelper.handleNewError('Start event is undefined')

    }
    apiSurvivalAnalysis.startConcept = this.startConcept.path
    if (this.startConcept.modifier) {
      apiSurvivalAnalysis.startConcept = this.startConcept.modifier.appliedConceptPath
      apiSurvivalAnalysis.startModifier = {
        ModifierKey: this.startConcept.modifier.path,
        AppliedPath: this.startConcept.modifier.appliedPath
      }
    }

    if (!this.endConcept) {
      throw ErrorHelper.handleNewError('End event is undefined')
    }
    apiSurvivalAnalysis.endConcept = this.endConcept.path
    if (this.endConcept.modifier) {
      apiSurvivalAnalysis.endConcept = this.endConcept.modifier.appliedConceptPath
      apiSurvivalAnalysis.endModifier = {
        ModifierKey: this.endConcept.modifier.path,
        AppliedPath: this.endConcept.modifier.appliedPath
      }
    }

    apiSurvivalAnalysis.timeLimit = this.limit
    if (!this.granularity) {
      throw ErrorHelper.handleNewError('Granularity is undefined')
    }
    apiSurvivalAnalysis.timeGranularity = this.granularity

    apiSurvivalAnalysis.startsWhen = this.startsWhen
    apiSurvivalAnalysis.endsWhen = this.endsWhen

    apiSurvivalAnalysis.cohortName = this.cohortService.selectedCohort.name
    apiSurvivalAnalysis.subGroupDefinitions = this.subGroups.map(sg => { return { groupName: sg.name, panels: this.generatePanels(sg) } })


    return this.apiSurvivalAnalysisService.survivalAnalysisAllNodes(apiSurvivalAnalysis)
  }

  survivalAnalysisDecrypt(survivalAnalysisResponse: ApiSurvivalAnalysisResponse): Observable<SurvivalAnalysisClear> {
    return forkJoin(
      // generate the ClearGroup[]
      survivalAnalysisResponse.results.map(group =>
        this.cryptoService.decryptIntegersWithEphemeralKey(
          [group.initialCount]
            .concat(group.groupResults.map(groupResult => groupResult.events.eventofinterest))
            .concat(group.groupResults.map(groupResult => groupResult.events.censoringevent))
        ).pipe(map(decrypted => {

          // assemble back the decrypted values
          const nbEvents = group.groupResults.length;
          let eventsOfInterest = decrypted.slice(1, nbEvents + 1);
          let censoringEvents = decrypted.slice(nbEvents + 1);
          console.log(`Decrypted 1+${eventsOfInterest.length}+${censoringEvents.length}=${decrypted.length} survival analysis elements`);

          // filter out points that are null
          let timepoints = group.groupResults.map(groupResult => groupResult.timepoint);
          for (let i = 0; i < nbEvents; i++) {
            if (eventsOfInterest[i] === 0 && censoringEvents[i] === 0) {
              timepoints.splice(i, 1);
              eventsOfInterest.splice(i, 1);
              censoringEvents.splice(i, 1);
              i--;
            }
          }
          console.log(`Decryption of survival analysis results: ${nbEvents - timepoints.length} points ignored`);

          // create cleartext group
          let cleartextGroup = new ClearGroup();
          cleartextGroup.groupId = group.groupID;
          cleartextGroup.groupResults = [];
          cleartextGroup.initialCount = decrypted[0];
          for (let i = 0; i < timepoints.length; i++) {
            cleartextGroup.groupResults.push({
              timepoint: timepoints[i],
              events: {
                eventOfInterest: eventsOfInterest[i],
                censoringEvent: censoringEvents[i]
              }
            });
          }
          return cleartextGroup;
        }))
      )
    ).pipe(
      // package it into SurvivalAnalysisClear
      map(clearGroups => {
        let res = new SurvivalAnalysisClear();
        res.results = clearGroups;
        return res;
      })
    );
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
      this._startsWhen,
      this._endConcept.name,
      this._endsWhen,
      subGroupsTextualRepresentations,
    )
  }
}
