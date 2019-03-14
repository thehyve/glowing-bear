/**
 * Copyright 2017 - 2019  The Hyve B.V.
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
import {TreeNodeService} from './tree-node.service';
import {PedigreeConstraint} from '../models/constraint-models/pedigree-constraint';
import {ResourceService} from './resource.service';
import {TreeNode} from 'primeng/api';
import {TransmartConstraintMapper} from '../utilities/transmart-utilities/transmart-constraint-mapper';
import {ConstraintHelper} from '../utilities/constraint-utilities/constraint-helper';
import {Pedigree} from '../models/constraint-models/pedigree';
import {MessageHelper} from '../utilities/message-helper';
import {StudyService} from './study.service';
import {CountService} from './count.service';
import {Dimension} from '../models/constraint-models/dimension';
import {Subject} from 'rxjs';

/**
 * This service concerns with
 * (1) translating string or JSON objects into Constraint class instances
 * (2) clear or restore constraints
 */
@Injectable({
  providedIn: 'root',
})
export class ConstraintService {

  private _rootConstraint: CombinationConstraint;

  /*
   * List keeping track of all available constraints.
   * By default, the empty, constraints are in here.
   * In addition, (partially) filled constraints are added.
   * The constraints should be copied when editing them.
   */
  private _allConstraints: Constraint[] = [];
  private _studyConstraints: Constraint[] = [];
  private _validPedigreeTypes: object[] = [];
  private _concepts: Concept[] = [];
  private _conceptConstraints: Constraint[] = [];

  // List of all available cohort types
  private _validDimensions: Dimension[] = [];
  private _validDimensionsUpdated: Subject<Dimension[]> = new Subject<Dimension[]>();

  /*
   * The maximum number of search results allowed when searching for a constraint
   */
  private _maxNumSearchResults = 100;

  constructor(private treeNodeService: TreeNodeService,
              private studyService: StudyService,
              private countService: CountService,
              private resourceService: ResourceService) {

    // Initialize the root constraints in the cohort selection
    this.rootConstraint = new CombinationConstraint();
    this.rootConstraint.isRoot = true;

    // Construct constraints
    this.loadEmptyConstraints();
    // load valid constraint dimensions
    this.loadValidDimensions();
    this.loadStudiesConstraints();
    // create the pedigree-related constraints
    this.loadPedigrees();
    // construct concepts from loading the tree nodes
    this.countService.loadCountMaps()
      .then(() => {
        this.treeNodeService.load();
      })
      .catch(err => {
        console.error(err);
      });
  }

  private loadEmptyConstraints() {
    this.allConstraints.push(new CombinationConstraint());
    this.allConstraints.push(new StudyConstraint());
    this.allConstraints.push(new ConceptConstraint());
  }

  private loadValidDimensions() {
    this.resourceService.validDimensions
      .subscribe(
        (validDimensions: Dimension[]) => {
          this.validDimensions = validDimensions;
        });
  }

  private loadStudiesConstraints() {
    this.studyService.studiesLoaded.asObservable().subscribe(
      (studiesLoaded: boolean) => {
        if (studiesLoaded) {
          // reset studies and study constraints
          this.studyConstraints = [];
          this.studyService.studies.forEach(study => {
            let constraint = new StudyConstraint();
            constraint.studies.push(study);
            this.studyConstraints.push(constraint);
            this.allConstraints.push(constraint);
          });
        } else {
          MessageHelper.alert('info', 'No studies found')
        }
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
   * Returns a list of all constraints that match the search word.
   * The constraints should be copied when editing them.
   * @param searchWord
   * @returns {Array}
   */
  public searchAllConstraints(searchWord: string): Constraint[] {
    searchWord = searchWord.toLowerCase();
    let results = [];
    if (searchWord === '') {
      results = [].concat(this.allConstraints.slice(0, this.maxNumSearchResults));
    } else if (searchWord && searchWord.length > 0) {
      let count = 0;
      this.allConstraints.forEach((constraint: Constraint) => {
        let text = constraint.textRepresentation.toLowerCase();
        if (text.indexOf(searchWord) > -1) {
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
   * ------------------------------------------------------------------------ constraint generation
   */

  /**
   * Get the constraint based on the current cohort selection criteria
   * @returns {Constraint}
   */
  get cohortSelectionConstraint(): Constraint {
    let constraint = <Constraint>this.rootConstraint;
    if (!ConstraintHelper.hasNonEmptyChildren(<CombinationConstraint>constraint)) {
      constraint = new TrueConstraint();
    }
    return constraint;
  }

  /**
   * Generate the constraint based on the variables selected gb-variables
   * @returns {Constraint}
   */
  public variableConstraint(variables: Concept[]): Constraint {
    const hasUnselected = variables.some((variable: Concept) => {
      return !variable.selected;
    });
    if (hasUnselected) {
      let result: CombinationConstraint = new CombinationConstraint();
      result.combinationState = CombinationState.Or;
      variables
        .filter((variable: Concept) => {
          return variable.selected;
        })
        .forEach((variable: Concept) => {
          let c = new ConceptConstraint();
          c.concept = variable;
          result.addChild(c)
        });
      return result;
    } else {
      return new TrueConstraint();
    }
  }

  /**
   * Clear the patient constraints
   */
  public clearCohortConstraint() {
    this.rootConstraint.children.length = 0;
  }

  public restoreCohortConstraint(constraint: Constraint) {
    if (constraint.className === 'CombinationConstraint') { // If it is a combination constraint
      this.rootConstraint.dimension = (<CombinationConstraint>constraint).dimension;
      const children = (<CombinationConstraint>constraint).children;
      let hasNegation = children.length === 2
        && (children[1].className === 'NegationConstraint' || children[0].className === 'NegationConstraint');
      if (hasNegation) {
        let negationConstraint =
          <NegationConstraint>(children[1].className === 'NegationConstraint' ? children[1] : children[0]);
        negationConstraint.constraint.negated = true;
        this.rootConstraint.addChild(negationConstraint.constraint);
        let remainingConstraint =
          <NegationConstraint>(children[0].className === 'NegationConstraint' ? children[1] : children[0]);
        this.restoreCohortConstraint(remainingConstraint);
      } else {
        for (let child of children) {
          this.rootConstraint.addChild(child);
        }
        this.rootConstraint.combinationState = (<CombinationConstraint>constraint).combinationState;
      }
    } else if (constraint.className === 'NegationConstraint') {
      (<NegationConstraint>constraint).constraint.negated = true;
      this.rootConstraint.addChild((<NegationConstraint>constraint).constraint);
    } else if (constraint.className !== 'TrueConstraint') {
      this.rootConstraint.addChild(constraint);
    }
  }

  // generate the constraint instance based on given node (e.g. tree node)
  public generateConstraintFromTreeNode(node: TreeNode): Constraint {
    let constraint: Constraint = null;
    if (this.treeNodeService.isTreeNodeStudy(node)) {
      let study: Study = new Study();
      study.id = node['constraint']['studyId'];
      constraint = new StudyConstraint();
      (<StudyConstraint>constraint).studies.push(study);
    } else if (this.treeNodeService.isTreeNodeLeaf(node)) {
      if (node['constraint']) {
        constraint = TransmartConstraintMapper.generateConstraintFromObject(node['constraint']);
      } else {
        let concept = this.treeNodeService.getConceptFromTreeNode(node);
        constraint = new ConceptConstraint();
        (<ConceptConstraint>constraint).concept = concept;
      }
    } else if (node['type'] === 'UNKNOWN') {
      let descendants = [];
      this.treeNodeService
        .getTreeNodeDescendantsWithExcludedTypes(node, ['UNKNOWN'], descendants);
      if (descendants.length < 6) {
        constraint = new CombinationConstraint();
        (<CombinationConstraint>constraint).combinationState = CombinationState.Or;
        for (let descendant of descendants) {
          let dConstraint = this.generateConstraintFromTreeNode(descendant);
          if (dConstraint) {
            (<CombinationConstraint>constraint).addChild(dConstraint);
          }
        }
        if ((<CombinationConstraint>constraint).children.length === 0) {
          constraint = null;
        }
      }
    }

    return constraint;
  }

  /*
   * ------------------------------------------------------------------------- getters and setters
   */

  get isTreeNodesLoading(): boolean {
    return !this.treeNodeService.isTreeNodesLoadingCompleted;
  }

  get rootConstraint(): CombinationConstraint {
    return this._rootConstraint;
  }

  set rootConstraint(value: CombinationConstraint) {
    this._rootConstraint = value;
  }

  get allConstraints(): Constraint[] {
    return this._allConstraints;
  }

  set allConstraints(value: Constraint[]) {
    this._allConstraints = value;
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

  get maxNumSearchResults(): number {
    return this._maxNumSearchResults;
  }

  set maxNumSearchResults(value: number) {
    this._maxNumSearchResults = value;
  }

  get validDimensions(): Dimension[] {
    return this._validDimensions;
  }

  set validDimensions(values: Dimension[]) {
    this._validDimensions = values;
    this.validDimensionsUpdated.next(values);
  }

  get validDimensionsUpdated(): Subject<Dimension[]> {
    return this._validDimensionsUpdated;
  }
}
