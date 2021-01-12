/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2019 - 2020  LDS EPFL
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {Constraint} from '../models/constraint-models/constraint';
import {Concept} from '../models/constraint-models/concept';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {CombinationState} from '../models/constraint-models/combination-state';
import {NegationConstraint} from '../models/constraint-models/negation-constraint';
import {DropMode} from '../models/drop-mode';
import {TreeNodeService} from './tree-node.service';
import {TreeNode} from '../models/tree-models/tree-node';
import {ConstraintHelper} from '../utilities/constraint-utilities/constraint-helper';
import {TreeNodeType} from '../models/tree-models/tree-node-type';
import {GenomicAnnotationConstraint} from '../models/constraint-models/genomic-annotation-constraint';
import {GenomicAnnotation} from '../models/constraint-models/genomic-annotation';
import {ErrorHelper} from '../utilities/error-helper';

/**
 * This service concerns with
 * (1) translating string or JSON objects into Constraint class instances
 * (2) clear or restore constraints
 */
@Injectable()
export class ConstraintService {

  private _rootInclusionConstraint: CombinationConstraint;
  private _rootExclusionConstraint: CombinationConstraint;

  /*
   * List keeping track of all available constraints.
   * By default, the empty, constraints are in here.
   * In addition, (partially) filled constraints are added.
   * The constraints should be copied when editing them.
   */
  private _allConstraints: Constraint[] = [];
  private _concepts: Concept[] = [];
  private _conceptLabels: string[] = [];
  private _conceptConstraints: Constraint[] = [];
  private _genomicAnnotations: GenomicAnnotation[] = [];

  /*
   * The maximum number of search results allowed when searching for a constraint
   */
  private _maxNumSearchResults = 100;

  public static depthOfConstraint(constraint: Constraint): number {
    let depth = 0;
    if (constraint.parentConstraint !== null) {
      depth++;
      depth += this.depthOfConstraint(constraint.parentConstraint);
    }
    return depth;
  }

  constructor(private treeNodeService: TreeNodeService) {
    // Initialize the root inclusion and exclusion constraints in the 1st step
    this.rootInclusionConstraint = new CombinationConstraint();
    this.rootInclusionConstraint.isRoot = true;
    this.rootExclusionConstraint = new CombinationConstraint();
    this.rootExclusionConstraint.isRoot = true;
  }

  /**
   * Returns a list of all constraints that match the query string.
   * The constraints should be copied when editing them.
   * @param query
   * @returns {Array}
   */
  public searchAllConstraints(query: string): Constraint[] {
    query = query.toLowerCase();
    let results = [];
    if (query === '') {
      results = [].concat(this.allConstraints.slice(0, this.maxNumSearchResults));
    } else if (query && query.length > 0) {
      let count = 0;
      this.allConstraints.forEach((constraint: Constraint) => {
        let text = constraint.textRepresentation.toLowerCase();
        if (text.indexOf(query) > -1) {
          results.push(constraint);
          count++;
          if (count >= this.maxNumSearchResults) {
            return results;
          }
        }
      });
    }
    return results;
  }

  public hasConstraint(): Boolean {
    return this.hasInclusionConstraint() || this.hasExclusionConstraint();
  }

  public hasInclusionConstraint(): Boolean {
    return ConstraintHelper.hasNonEmptyChildren(this.rootInclusionConstraint);
  }

  public hasExclusionConstraint(): Boolean {
    return ConstraintHelper.hasNonEmptyChildren(this.rootExclusionConstraint);
  }

  /**
   * Generate the constraint corresponding to the query.
   */
  public generateConstraint(): Constraint {
    let resultConstraint: Constraint;

    if (!this.hasInclusionConstraint() && !this.hasExclusionConstraint()) {
      throw ErrorHelper.handleNewError('Empty constraints');

    } else if (this.hasInclusionConstraint() && !this.hasExclusionConstraint()) {
      resultConstraint = this.rootInclusionConstraint;

    } else if (!this.hasInclusionConstraint() && this.hasExclusionConstraint()) {
      resultConstraint = new NegationConstraint(this.rootExclusionConstraint);

    } else if (this.hasInclusionConstraint() && this.hasExclusionConstraint()) {
      resultConstraint = new CombinationConstraint();
      (resultConstraint as CombinationConstraint).addChild(this.rootInclusionConstraint);
      (resultConstraint as CombinationConstraint).addChild(new NegationConstraint(this.rootExclusionConstraint));
    }

    return resultConstraint;
  }

  /**
   * Clear the patient constraints
   */
  public clearConstraint() {
    this.rootInclusionConstraint.children.length = 0;
    this.rootExclusionConstraint.children.length = 0;
  }

  // generate the constraint instance based on given node (e.g. tree node)
  public generateConstraintFromTreeNode(selectedNode: TreeNode, dropMode: DropMode): Constraint {
    let constraint: Constraint = null;
    // if the dropped node is a tree node
    if (dropMode === DropMode.TreeNode) {
      let treeNode = selectedNode;
      switch (treeNode.nodeType) {

        case TreeNodeType.CONCEPT:
          let concept = this.treeNodeService.getConceptFromTreeNode(treeNode);
          constraint = new ConceptConstraint(treeNode);
          (<ConceptConstraint>constraint).concept = concept;
          break;

        case TreeNodeType.GENOMIC_ANNOTATION:
          // case where node is a genomic annotation
          constraint = new GenomicAnnotationConstraint();
          (<GenomicAnnotationConstraint>constraint).annotation.displayName = treeNode.displayName;
          (<GenomicAnnotationConstraint>constraint).annotation.name = treeNode.name;
          (<GenomicAnnotationConstraint>constraint).annotation.path = treeNode.path;
          break;

        case TreeNodeType.MODIFIER:
          let sourceConcept = this.treeNodeService.getConceptFromModifierTreeNode(treeNode);
          constraint = new ConceptConstraint(treeNode);
          (<ConceptConstraint>constraint).concept = sourceConcept;
          break;

        case TreeNodeType.CONTAINER:
        case TreeNodeType.UNKNOWN:
          let descendants = [];
          this.treeNodeService.getTreeNodeDescendantsWithExcludedTypes(
            selectedNode,
            [TreeNodeType.UNKNOWN],
            descendants
          );

          if (descendants.length < 6) {
            constraint = new CombinationConstraint();
            (<CombinationConstraint>constraint).combinationState = CombinationState.Or;
            for (let descendant of descendants) {
              let dConstraint = this.generateConstraintFromTreeNode(descendant, DropMode.TreeNode);
              if (dConstraint) {
                (<CombinationConstraint>constraint).addChild(dConstraint);
              }
            }
            if ((<CombinationConstraint>constraint).children.length === 0) {
              constraint = null;
            }
          } else {
            console.warn(`Too many descendants: ${descendants.length}`);
          }
          break;

        default:
          console.warn(`Could not get constraint from node ${treeNode.path}`);
      }
    }

    return constraint;
  }

  get rootInclusionConstraint(): CombinationConstraint {
    return this._rootInclusionConstraint;
  }

  set rootInclusionConstraint(value: CombinationConstraint) {
    this._rootInclusionConstraint = value;
  }

  get rootExclusionConstraint(): CombinationConstraint {
    return this._rootExclusionConstraint;
  }

  set rootExclusionConstraint(value: CombinationConstraint) {
    this._rootExclusionConstraint = value;
  }

  get allConstraints(): Constraint[] {
    return this._allConstraints;
  }

  set allConstraints(value: Constraint[]) {
    this._allConstraints = value;
  }

  get conceptConstraints(): Constraint[] {
    return this._conceptConstraints;
  }

  set conceptConstraints(value: Constraint[]) {
    this._conceptConstraints = value;
  }

  get concepts(): Concept[] {
    return this._concepts;
  }

  set concepts(value: Concept[]) {
    this._concepts = value;
  }

  get conceptLabels(): string[] {
    return this._conceptLabels;
  }

  set conceptLabels(value: string[]) {
    this._conceptLabels = value;
  }

  get maxNumSearchResults(): number {
    return this._maxNumSearchResults;
  }

  set maxNumSearchResults(value: number) {
    this._maxNumSearchResults = value;
  }

  get genomicAnnotations(): GenomicAnnotation[] {
    return this._genomicAnnotations;
  }

  set genomicAnnotations(value: GenomicAnnotation[]) {
    this._genomicAnnotations = value;
  }

}

