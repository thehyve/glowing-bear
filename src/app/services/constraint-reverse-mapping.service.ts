/**
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Constraint } from '../models/constraint-models/constraint';
import { ApiI2b2Panel } from '../models/api-request-models/medco-node/api-i2b2-panel';
import { Injectable } from '@angular/core';
import { CombinationConstraint } from 'app/models/constraint-models/combination-constraint';
import { ConceptConstraint } from 'app/models/constraint-models/concept-constraint';
import { ApiI2b2Timing } from 'app/models/api-request-models/medco-node/api-i2b2-timing';
import { ApiI2b2Item } from 'app/models/api-request-models/medco-node/api-i2b2-item';
import { Concept } from 'app/models/constraint-models/concept';
import { Modifier } from 'app/models/constraint-models/modifier';
import { CombinationState } from 'app/models/constraint-models/combination-state';
import { ConstraintService } from './constraint.service';
import { TreeNodeService } from './tree-node.service';
import { Observable, of, zip } from 'rxjs';
import { modifiedConceptPath } from 'app/utilities/constraint-utilities/modified-concept-path';
import { ExploreSearchService } from './api/medco-node/explore-search.service';
import { map } from 'rxjs/operators';
import { MessageHelper } from 'app/utilities/message-helper';
import { DropMode } from 'app/models/drop-mode';



@Injectable()
export class ConstraintReverseMappingService {

  constructor(private constraintService: ConstraintService, private exploreSearchService: ExploreSearchService) { }
  /**
   * 
   * Maps an array of panels to a constraint if the panels are fully composed
   * of clear concepts. If one or more encrypted concepts are found, null is returned instead.
   * 
   * @param panels 
   */
  public mapPanels(panels: ApiI2b2Panel[], targetPanelTiming: ApiI2b2Timing[]): Observable<Constraint> {
    targetPanelTiming = new Array<ApiI2b2Timing>(panels.length)
    targetPanelTiming.fill(ApiI2b2Timing.any)

    if (panels.length === 1 && panels[0].items.length === 1) {

      return this.mapItem(panels[0].items[0])

    } else {
      return zip(panels.map((panel, index) => this.mapPanel(panel, targetPanelTiming[index]))).pipe(map(constraints => {
        let combinationConstraint = new CombinationConstraint()
        constraints.forEach(constraint => { combinationConstraint.addChild(constraint) })
        combinationConstraint.combinationState = CombinationState.And
        return combinationConstraint

      }))

    }
  }

  /**
   * 
   * Maps one panel to a constraint if the panel is fully composed
   * of clear concepts and returns false.
   * If one or more encrypted concepts are found, null is set instead and true is returned.
   * 
   * @param panelTiming
   * @param panel 
   * @param target 
   */
  private mapPanel(panel: ApiI2b2Panel, panelTiming: ApiI2b2Timing): Observable<Constraint> {
    for (const item of panel.items) {
      if (item.encrypted) {
        // restoration of encrypted concept is not supported
        return null
      }
    }
    panelTiming = panel.panelTiming
    if (panel.items.length === 1) {
      return this.mapItem(panel.items[0])
    } else {
      return zip(panel.items.map(item => this.mapItem(item))).pipe(map(constraints => {
        let combinationConstraint = new CombinationConstraint()
        constraints.forEach(constraint => { combinationConstraint.addChild(constraint) })
        combinationConstraint.combinationState = CombinationState.Or
        return combinationConstraint
      }
      ))
    }
  }

  private mapItem(item: ApiI2b2Item): Observable<Constraint> {
    if (item.encrypted === true) {
      // this should have been checked out before
      return null
    }
    var conceptURI = item.modifier ? modifiedConceptPath(item.queryTerm, item.modifier.modifierKey) : item.queryTerm
    // check if the concept is already loaded
    var existingConstraint = this.constraintService.allConstraints.find(value => (value instanceof ConceptConstraint) && (<ConceptConstraint>value).concept.path === conceptURI)
    if (existingConstraint) {
      return of(existingConstraint)
    }
    // else, get details
    let obs = (item.modifier) ?
      this.exploreSearchService.exploreSearchModifierInfo(item.modifier.modifierKey, item.modifier.appliedPath, item.queryTerm) :
      this.exploreSearchService.exploreSearchConceptInfo(item.queryTerm)

    return obs.pipe(map(treenodes => {
      switch (treenodes.length) {
        case 0:
          return null
        case 1:
          return treenodes[0]
        default:
          MessageHelper.alert('warn', `expected result length 1 got ${treenodes.length} from search info request, keeping the first one`)
          return treenodes[0]
      }
    }),
      map(treenode => this.constraintService.generateConstraintFromTreeNode(treenode, DropMode.TreeNode)))
  }
}
