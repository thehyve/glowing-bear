/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {Constraint} from '../models/constraint-models/constraint';
import {TrueConstraint} from '../models/constraint-models/true-constraint';
import {StudyConstraint} from '../models/constraint-models/study-constraint';
import {Study} from '../models/constraint-models/study';
import {Concept} from '../models/constraint-models/concept';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {CombinationState} from '../models/constraint-models/combination-state';
import {NegationConstraint} from '../models/constraint-models/negation-constraint';
import {DropMode} from '../models/drop-mode';
import {TreeNodeService} from './tree-node.service';
import {SubjectSetConstraint} from '../models/constraint-models/subject-set-constraint';
import {PedigreeConstraint} from '../models/constraint-models/pedigree-constraint';
import {ResourceService} from './resource.service';
import {TreeNode} from 'primeng/api';
import {ConstraintMark} from '../models/constraint-models/constraint-mark';
import {TransmartConstraintMapper} from '../utilities/transmart-utilities/transmart-constraint-mapper';
import {ConstraintHelper} from '../utilities/constraint-utilities/constraint-helper';
import {Pedigree} from '../models/constraint-models/pedigree';

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
  private _studies: Study[] = [];
  private _studyConstraints: Constraint[] = [];
  private _validPedigreeTypes: object[] = [];
  private _concepts: Concept[] = [];
  private _conceptLabels: string[] = [];
  private _conceptConstraints: Constraint[] = [];

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

  public constraint_1_2(): Constraint {
    const c1 = this.constraint_1();
    const c2 = this.constraint_2();
    let combo = new CombinationConstraint();
    combo.addChild(c1);
    combo.addChild(c2);
    return combo;
  }

  constructor(private treeNodeService: TreeNodeService,
              private resourceService: ResourceService) {
    // Initialize the root inclusion and exclusion constraints in the 1st step
    this.rootInclusionConstraint = new CombinationConstraint();
    this.rootInclusionConstraint.isRoot = true;
    this.rootExclusionConstraint = new CombinationConstraint();
    this.rootExclusionConstraint.isRoot = true;

    // Initialize the root inclusion and exclusion constraints in the 1st step
    this.rootInclusionConstraint = new CombinationConstraint();
    this.rootInclusionConstraint.isRoot = true;
    this.rootInclusionConstraint.mark = ConstraintMark.SUBJECT;
    this.rootExclusionConstraint = new CombinationConstraint();
    this.rootExclusionConstraint.isRoot = true;
    this.rootExclusionConstraint.mark = ConstraintMark.SUBJECT;

    // Construct constraints
    this.loadEmptyConstraints();
    this.loadStudies();
    // create the pedigree-related constraints
    this.loadPedigrees();
    // construct concepts while loading the tree nodes
    this.treeNodeService.load();
  }

  private loadEmptyConstraints() {
    this.allConstraints.push(new CombinationConstraint());
    this.allConstraints.push(new StudyConstraint());
    this.allConstraints.push(new ConceptConstraint());
  }

  private loadStudies() {
    this.resourceService.getStudies()
      .subscribe(
        (studies: Study[]) => {
          // reset studies and study constraints
          this.studies = studies;
          this.studyConstraints = [];
          studies.forEach(study => {
            let constraint = new StudyConstraint();
            constraint.studies.push(study);
            this.studyConstraints.push(constraint);
            this.allConstraints.push(constraint);
          });
        },
        err => console.error(err)
      );
  }

  private loadPedigrees() {
    this.resourceService.getPedigrees()
      .subscribe(
        (pedigrees: Pedigree[]) => {
          for (let p of pedigrees) {
            let pedigreeConstraint: PedigreeConstraint = new PedigreeConstraint(p.label);
            pedigreeConstraint.description = p.description;
            pedigreeConstraint.biological = p.biological;
            pedigreeConstraint.symmetrical = p.symmetrical;
            this.allConstraints.push(pedigreeConstraint);
            this.validPedigreeTypes.push({
              type: pedigreeConstraint.relationType,
              text: pedigreeConstraint.textRepresentation
            });
          }
        },
        err => console.error(err)
      );
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

  /*
   * ------------ constraint generation in the 1st step ------------
   */
  /**
   * In the 1st step,
   * Generate the constraint for retrieving the patients with only the inclusion criteria
   * @returns {Constraint}
   */
  public generateInclusionConstraint(): Constraint {
    let inclusionConstraint: Constraint = <Constraint>this.rootInclusionConstraint;
    return ConstraintHelper.hasNonEmptyChildren(<CombinationConstraint>inclusionConstraint) ?
      inclusionConstraint : new TrueConstraint();
  }

  public hasExclusionConstraint(): Boolean {
    return ConstraintHelper.hasNonEmptyChildren(this.rootExclusionConstraint);
  }

  /**
   * In the 1st step,
   * Generate the constraint for retrieving the patients with the exclusion criteria,
   * but also in the inclusion set
   * @returns {CombinationConstraint}
   */
  public generateExclusionConstraint(): Constraint {
    if (this.hasExclusionConstraint()) {
      // Inclusion part, which is what the exclusion count is calculated from
      let inclusionConstraint = this.generateInclusionConstraint();
      let exclusionConstraint = <Constraint>this.rootExclusionConstraint;

      let combination = new CombinationConstraint();
      combination.addChild(inclusionConstraint);
      combination.addChild(exclusionConstraint);
      return combination;
    } else {
      return undefined;
    }
  }

  public constraint_1(): Constraint {
    return this.generateSelectionConstraint();
  }

  /**
   * In the 1st step,
   * Get the constraint intersected on 'inclusion' and 'not exclusion' constraints
   * @returns {Constraint}
   */
  private generateSelectionConstraint(): Constraint {
    let resultConstraint: Constraint;
    let inclusionConstraint = <Constraint>this.rootInclusionConstraint;
    let exclusionConstraint = <Constraint>this.rootExclusionConstraint;
    let trueInclusion = false;
    // Inclusion part
    if (!ConstraintHelper.hasNonEmptyChildren(<CombinationConstraint>inclusionConstraint)) {
      inclusionConstraint = new TrueConstraint();
      trueInclusion = true;
    }

    // Only use exclusion if there's something there
    if (ConstraintHelper.hasNonEmptyChildren(<CombinationConstraint>exclusionConstraint)) {
      // Wrap exclusion in negation
      let negatedExclusionConstraint = new NegationConstraint(exclusionConstraint);

      // If there is some constraint other than a true constraint in the inclusion,
      // form a proper combination constraint to return
      if (!trueInclusion) {
        let combination = new CombinationConstraint();
        combination.combinationState = CombinationState.And;
        combination.addChild(inclusionConstraint);
        combination.addChild(negatedExclusionConstraint);
        resultConstraint = combination;
      } else {
        resultConstraint = negatedExclusionConstraint;
      }
    } else {
      // Otherwise just return the inclusion part
      resultConstraint = inclusionConstraint;
    }
    resultConstraint.mark = ConstraintMark.SUBJECT;
    return resultConstraint;
  }

  /**
   * Generate a new constraint based on a current selection in the 1st step
   * only if subjectSetConstraint is not up to date with the selection
   * @returns {Constraint}
   */
  public subjectSetConstraintIfDifferentInCurrentSelection(): Constraint {
    let currentSelectionConstraint = this.generateSelectionConstraint();
    if (this.subjectSetConstraint.requestConstraints !== currentSelectionConstraint) {
      return currentSelectionConstraint;
    } else {
      return null;
    }
  }

  /**
   * Update the subjectSetConstraint when a new subject set is created
   * @param {number} id
   * @param {Constraint} updatedConstraint
   */
  public updateSubjectSetConstraint(id: number, updatedConstraint: Constraint) {
    let newSubjectSetConstraint = new SubjectSetConstraint();
    newSubjectSetConstraint.id = id;
    newSubjectSetConstraint.requestConstraints = updatedConstraint;
    this.subjectSetConstraint = newSubjectSetConstraint;
  }

  /**
   * Clear the patient constraints
   */
  public clearConstraint_1() {
    this.rootInclusionConstraint.children.length = 0;
    this.rootExclusionConstraint.children.length = 0;
  }

  public restoreConstraint_1(constraint: Constraint) {
    if (constraint.className === 'CombinationConstraint') { // If it is a combination constraint
      const children = (<CombinationConstraint>constraint).children;
      let hasNegation = children.length === 2
        && (children[1].className === 'NegationConstraint' || children[0].className === 'NegationConstraint');
      if (hasNegation) {
        let negationConstraint =
          <NegationConstraint>(children[1].className === 'NegationConstraint' ? children[1] : children[0]);
        this.rootExclusionConstraint.addChild(negationConstraint.constraint);
        let remainingConstraint =
          <NegationConstraint>(children[0].className === 'NegationConstraint' ? children[1] : children[0]);
        this.restoreConstraint_1(remainingConstraint);
      } else {
        for (let child of children) {
          this.rootInclusionConstraint.addChild(child);
        }
        this.rootInclusionConstraint.combinationState = (<CombinationConstraint>constraint).combinationState;
      }
    } else if (constraint.className === 'NegationConstraint') {
      this.rootExclusionConstraint.addChild((<NegationConstraint>constraint).constraint);
    } else if (constraint.className !== 'TrueConstraint') {
      this.rootInclusionConstraint.addChild(constraint);
    }
  }

  /*
   * ------------ constraint generation in the 2nd step ------------
   */
  public constraint_2() {
    return this.generateProjectionConstraint();
  }

  /**
   * Get the constraint of selected concept variables in the 2nd step
   * @returns {any}
   */
  private generateProjectionConstraint(): Constraint {
    let constraint = null;
    let selectedTreeNodes = this.treeNodeService.selectedProjectionTreeData;
    if (selectedTreeNodes && selectedTreeNodes.length > 0) {
      let leaves = [];
      constraint = new CombinationConstraint();
      constraint.combinationState = CombinationState.Or;

      for (let selectedTreeNode of selectedTreeNodes) {
        let visualAttributes = selectedTreeNode['visualAttributes'];
        if (visualAttributes && visualAttributes.includes('LEAF')) {
          leaves.push(selectedTreeNode);
        }
      }
      for (let leaf of leaves) {
        const leafConstraint = TransmartConstraintMapper.generateConstraintFromObject(leaf['constraint']);
        if (leafConstraint) {
          constraint.addChild(leafConstraint);
        } else {
          console.error('Failed to create constrain from: ', leaf);
        }
      }
    } else {
      constraint = new NegationConstraint(new TrueConstraint());
    }

    return constraint;
  }

  // generate the constraint instance based on given node (e.g. tree node)
  public generateConstraintFromTreeNode(selectedNode: TreeNode, dropMode: DropMode): Constraint {
    let constraint: Constraint = null;
    // if the dropped node is a tree node
    if (dropMode === DropMode.TreeNode) {
      let treeNode = selectedNode;
      let treeNodeType = treeNode['type'];
      if (treeNodeType === 'STUDY') {
        let study: Study = new Study();
        study.id = treeNode['constraint']['studyId'];
        constraint = new StudyConstraint();
        (<StudyConstraint>constraint).studies.push(study);
      } else if (treeNodeType === 'NUMERIC' ||
        treeNodeType === 'CATEGORICAL' ||
        treeNodeType === 'DATE' ||
        treeNodeType === 'HIGH_DIMENSIONAL' ||
        treeNodeType === 'TEXT') {
        if (treeNode['constraint']) {
          constraint = TransmartConstraintMapper.generateConstraintFromObject(treeNode['constraint']);
        } else {
          let concept = this.treeNodeService.getConceptFromTreeNode(treeNode);
          constraint = new ConceptConstraint();
          (<ConceptConstraint>constraint).concept = concept;
        }
      } else if (treeNodeType === 'UNKNOWN') {
        let descendants = [];
        this.treeNodeService
          .getTreeNodeDescendantsWithExcludedTypes(selectedNode,
            ['UNKNOWN'], descendants);
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
        }
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

  get studies(): Study[] {
    return this._studies;
  }

  set studies(value: Study[]) {
    this._studies = value;
  }

  get studyConstraints(): Constraint[] {
    return this._studyConstraints;
  }

  set studyConstraints(value: Constraint[]) {
    this._studyConstraints = value;
  }

  get validPedigreeTypes(): object[] {
    return this._validPedigreeTypes;
  }

  set validPedigreeTypes(value: object[]) {
    this._validPedigreeTypes = value;
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
}
