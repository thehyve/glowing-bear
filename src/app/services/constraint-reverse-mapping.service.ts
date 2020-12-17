/**
 * Copyright 2020 CHUV
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
import { Observable, of } from 'rxjs';
import { modifiedConceptPath } from 'app/utilities/constraint-utilities/modified-concept-path';
import { ExploreSearchService } from './api/medco-node/explore-search.service';



@Injectable()
export class ConstraintMappingService {

  constructor(private constraintService: ConstraintService,private treeNodeService: TreeNodeService, private exploreSearchService: ExploreSearchService) { }
  /**
   * 
   * Maps an array of panels to a constraint if the panels are fully composed
   * of clear concepts. If one or more encrypted concepts are found, null is returned instead.
   * 
   * @param panels 
   */
  public mapPanels(panels: ApiI2b2Panel[], targetConstraint: Constraint, targetPanelTiming: ApiI2b2Timing[]): boolean {
    targetPanelTiming = new Array<ApiI2b2Timing>()
    if (panels.length === 1 && panels[0].items.length === 1) {

      this.mapPanel(panels[0], targetConstraint, targetPanelTiming[0])

    } else {
      var combiConstraint = new CombinationConstraint()

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
  private mapPanel(panel: ApiI2b2Panel, targetConstraint: Constraint, panelTiming: ApiI2b2Timing): boolean {
    panelTiming = panel.panelTiming
    if (panel.items.length === 1) {
      targetConstraint = new ConceptConstraint()
      var encryption = this.mapItem(panel.items[0], targetConstraint)
      if (encryption === true) {
        targetConstraint = null
        return true
      }
    } else {
      targetConstraint = new CombinationConstraint();
      (<CombinationConstraint>targetConstraint).combinationState = CombinationState.Or

      for (var item of panel.items) {

        var childConstraint = new ConceptConstraint()
        var encryption = this.mapItem(item, childConstraint)
        if (encryption === true) {
          targetConstraint = null
          return true
        }
        (<CombinationConstraint>targetConstraint).addChild(childConstraint)

      }
    }
  }

  private mapItem(item: ApiI2b2Item): Observable<Constraint> {
    if (item.encrypted === true) {
      // this should have been checked out before
      return null
    }
    var conceptURI = item.modifier? modifiedConceptPath(item.queryTerm,item.modifier.modifierKey):item.queryTerm
    // check if the concept is already loaded
    var existingConstraint = this.constraintService.allConstraints.find(value=> (value instanceof ConceptConstraint) && (<ConceptConstraint>value).concept.path === conceptURI)
    if (existingConstraint){
      return of(existingConstraint)
    }
    // else, get details
    if (item.modifier){

    } else {

    }




  }
}
