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
import { ConstraintService } from './constraint.service';
import { Observable, of } from 'rxjs';
import { ExploreSearchService } from './api/medco-node/explore-search.service';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {MessageHelper} from '../utilities/message-helper';
import {modifiedConceptPath} from '../utilities/constraint-utilities/modified-concept-path';
import {ValueType} from '../models/constraint-models/value-type';
import {ApiI2b2Item} from '../models/api-request-models/medco-node/api-i2b2-item';
import {ApiI2b2Timing} from '../models/api-request-models/medco-node/api-i2b2-timing';
import {CombinationState} from '../models/constraint-models/combination-state';
import {TextOperator} from '../models/constraint-models/text-operator';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {NumericalOperator} from '../models/constraint-models/numerical-operator';
import {DropMode} from '../models/drop-mode';
import {TreeNode} from '../models/tree-models/tree-node';

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
  public mapPanels(panels: ApiI2b2Panel[]): Observable<Constraint> {



    if (panels.length === 1 && panels[0].conceptItems.length === 1) {

      return this.mapItem(panels[0].conceptItems[0]).pipe(map(constraint => {
        constraint.panelTimingSameInstance = panels[0].panelTiming === ApiI2b2Timing.sameInstanceNum
        constraint.excluded = panels[0].not
        return constraint
      }))

    } else {

      return forkJoin(panels.map(panel => this.mapPanel(panel))).pipe(map(constraints => {
        let combinationConstraint = new CombinationConstraint()
        constraints.forEach(constraint => { 
          combinationConstraint.addChild(constraint) })
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
  private mapPanel(panel: ApiI2b2Panel): Observable<Constraint> {
    for (const item of panel.conceptItems) {
      if (item.encrypted) {
        // restoration of encrypted concept is not supported
        return null
      }
    }
    let sameInstance = panel.panelTiming === ApiI2b2Timing.sameInstanceNum
    if (panel.conceptItems.length === 1) {
      return this.mapItem(panel.conceptItems[0]).pipe(map(constraint => {
        constraint.panelTimingSameInstance = sameInstance
        constraint.excluded = panel.not
        return constraint
      }))
    } else {
      return forkJoin(panel.conceptItems.map(item => this.mapItem(item))).pipe(map(constraints => {
        let combinationConstraint = new CombinationConstraint()
        constraints.forEach(constraint => { combinationConstraint.addChild(constraint) })
        combinationConstraint.combinationState = CombinationState.Or
        combinationConstraint.panelTimingSameInstance = sameInstance
        combinationConstraint.excluded = panel.not
        return combinationConstraint
      }
      ))
    }
  }

  private mapItem(item: ApiI2b2Item): Observable<ConceptConstraint> {
    let modificated: Observable<TreeNode>
    let resTreeNode: Observable<TreeNode>
    if (item.encrypted === true) {
      // this should have been checked out before
      return null
    }
    let conceptURI = item.modifier ? modifiedConceptPath(item.queryTerm, item.modifier.modifierKey) : item.queryTerm
    // check if the concept is already loaded
    let existingConstraint = this.constraintService.allConstraints.find(
      value => (value instanceof ConceptConstraint) && ((<ConceptConstraint>value).concept.path === conceptURI))
    if (existingConstraint) {
      let existingRes = (existingConstraint as ConceptConstraint);
      this.setValues(existingRes, item.value, item.operator)
      return of(existingConstraint as ConceptConstraint)
    }
    // else, get details
    let obs = (item.modifier) ?
      this.exploreSearchService.exploreSearchModifierInfo(item.modifier.modifierKey, item.modifier.appliedPath, item.queryTerm) :
      this.exploreSearchService.exploreSearchConceptInfo(item.queryTerm)

    let treeNodeObs = obs.pipe(map(treenodes => {
      switch (treenodes.length) {
        case 0:
          return null
        case 1:
          return treenodes[0]
        default:
          return treenodes[0]
      }
    }))
    if (item.modifier) {
      let modificandum = new ApiI2b2Item()
      modificandum.encrypted = item.encrypted
      modificandum.modifier = null
      modificandum.operator = item.operator
      modificandum.value = item.value
      modificandum.type = item.type
      modificandum.queryTerm = item.queryTerm
      modificated = this.mapItem(modificandum).pipe(map(({ treeNode }) => treeNode))

      resTreeNode = forkJoin([treeNodeObs, modificated]).pipe(map(([modifierNode, modificatedNode]) => {
        modifierNode.appliedConcept = modificatedNode.clone()
        return modifierNode
      }))
    } else {
      resTreeNode = treeNodeObs
    }
    return resTreeNode.pipe(
      map(treenode => {
        let res = this.constraintService.generateConstraintFromTreeNode(treenode, DropMode.TreeNode) as ConceptConstraint
        this.setValues(res, item.value, item.operator)
        return res
      })
    )
  }


  private setValues(constraint: ConceptConstraint, value: string, operator: string) {
    if (operator) {
      switch (constraint.concept.type) {

        // ----- numerical operation



        case ValueType.NUMERICAL:
          constraint.applyNumericalOperator = true
          switch (operator) {
            case NumericalOperator.EQUAL:
            case NumericalOperator.GREATER:
            case NumericalOperator.GREATER_OR_EQUAL:
            case NumericalOperator.LOWER:
            case NumericalOperator.LOWER_OR_EQUAL:
            case NumericalOperator.NOT_EQUAL:
              constraint.numericalOperator = operator
              constraint.numValue = constraint.concept.isInteger ? parseInt(value, 10) : parseFloat(value)
              break;
            case NumericalOperator.BETWEEN:
              constraint.numericalOperator = operator;
              let boundaries = value.split('and').map(substring => substring.trim())
              constraint.minValue = constraint.concept.isInteger ? parseInt(boundaries[0], 10) : parseFloat(boundaries[0])
              constraint.maxValue = constraint.concept.isInteger ? parseInt(boundaries[1], 10) : parseFloat(boundaries[1])
              break;
            default:
              MessageHelper.alert('error', `While parsing concept constraint ${constraint.textRepresentation}, numerical operator ${operator} unkown`)
              break;
          }
          break;



        // ------- text operation




        case ValueType.TEXT:
          constraint.applyTextOperator = true
          switch (operator) {
            case TextOperator.LIKE_BEGIN:
            case TextOperator.LIKE_CONTAINS:
            case TextOperator.LIKE_END:
            case TextOperator.LIKE_EXACT:
              constraint.textOperator = operator
              constraint.textOperatorValue = value
              break;
            case TextOperator.IN:
              constraint.textOperator = operator
              constraint.textOperatorValue = value.split(',').map(substr => {
                let trimmed = substr.trim()
                return trimmed.replace('^\'|\'$', '')
              }).join(',')
              break;
            default:
              MessageHelper.alert('error', `While parsing concept constraint ${constraint.textRepresentation}, text operator ${operator} unkown`)
              break;

          }
          break;
        case ValueType.SIMPLE:
          break;
        default:
          MessageHelper.alert('error', `While parsing concept constraint ${constraint.textRepresentation}, type ${constraint.concept.type} unkown`)
          break;
      }
    }

  }
}
