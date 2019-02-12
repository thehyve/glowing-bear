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
import {TreeNodeService} from './tree-node.service';
import {PedigreeConstraint} from '../models/constraint-models/pedigree-constraint';
import {ResourceService} from './resource.service';
import {TreeNode} from 'primeng/api';
import {ConstraintMark} from '../models/constraint-models/constraint-mark';
import {TransmartConstraintMapper} from '../utilities/transmart-utilities/transmart-constraint-mapper';
import {ConstraintHelper} from '../utilities/constraint-utilities/constraint-helper';
import {Pedigree} from '../models/constraint-models/pedigree';
import {MessageHelper} from '../utilities/message-helper';
import {StudyService} from './study.service';
import {CountItem} from '../models/aggregate-models/count-item';
import {HttpErrorResponse} from '@angular/common/http';
import {ErrorHelper} from '../utilities/error-helper';
import {Subject, Observable} from 'rxjs';
import {VariablesViewMode} from '../models/variables-view-mode';
import {CategorizedVariable} from '../models/constraint-models/categorized-variable';

/**
 * This service concerns with
 * (1) translating string or JSON objects into Constraint class instances
 * (2) clear or restore constraints
 */
@Injectable({
  providedIn: 'root',
})
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
  private _studyConstraints: Constraint[] = [];
  private _validPedigreeTypes: object[] = [];
  private _concepts: Concept[] = [];
  private _conceptConstraints: Constraint[] = [];

  /*
   * The maximum number of search results allowed when searching for a constraint
   */
  private _maxNumSearchResults = 100;

  /**
   * The map that holds the conceptCode -> count item relations
   *  e.g.
   * "EHR:DEM:AGE": {
   *   "observationCount": 3,
   *   "subjectCount": 3
   *  },
   * "EHR:VSIGN:HR": {
   *  "observationCount": 9,
   *  "subjectCount": 3
   * }
   */
  private _conceptCountMap: Map<string, CountItem>;
  /**
   * The map that holds the studyId -> count item relations
   * e.g.
   * "MIX_HD": {
   *   "observationCount": 12,
   *   "subjectCount": 3
   * }
   */
  private _studyCountMap: Map<string, CountItem>;
  /**
   * The map that holds the studyId -> conceptCode -> count item relations
   * e.g.
   * "SHARED_CONCEPTS_STUDY_A": {
   *    "DEMO:POB": {
   *        "observationCount": 2,
   *        "subjectCount": 2
   *    },
   *    "VSIGN:HR": {
   *        "observationCount": 3,
   *        "subjectCount": 3
   *    }
   * }
   */
  private _studyConceptCountMap: Map<string, Map<string, CountItem>>;

  // the subset of _studyConceptCountMap that holds the selected maps,
  // which corresponds to the selected cohort(s)
  private _selectedStudyConceptCountMap: Map<string, Map<string, CountItem>>;
  // the subset of _studyCountMap that holds the selected studies,
  // which corresponds to the selected cohort(s)
  private _selectedStudyCountMap: Map<string, CountItem>;
  // the subset of _conceptCountMap that holds the selected maps,
  // which corresponds to the selected cohort(s)
  private _selectedConceptCountMap: Map<string, CountItem>;
  // the async subject telling if the selectedConceptCountMap is updated
  private _selectedConceptCountMapUpdated: Subject<Map<string, CountItem>>
    = new Subject<Map<string, CountItem>>();

  /*
  * The list of concepts that correspond to
  * the leaf/concept tree nodes that are narrowed down
  * when user defines a cohort or a combination of cohorts.
  */
  private _variables: Concept[] = [];
  private _categorizedVariables: Array<CategorizedVariable> = [];
  // The async subject that tells if variables are updated according to the selectedConceptCountMap
  private _variablesUpdated: Subject<Concept[]> = new Subject<Concept[]>();
  // The async subject that tells if the selection of variables is changed according to user action
  private _selectedVariablesUpdated: Subject<Concept[]> = new Subject<Concept[]>();
  // Flag indicating if the variables are being updated (gb-variables)
  private _isUpdatingVariables = false;

  private _draggedVariable: Concept = null;
  // The scope identifier used by primeng for drag and drop
  // [pDraggable] in gb-variables.component
  // [pDroppable] in gb-fractalis-control.component
  // [pDroppable] in gb-cross-table.component
  public variablesDragDropScope = 'PrimeNGVariablesDragDropContext';

  private _variablesViewMode: VariablesViewMode;

  public static depthOfConstraint(constraint: Constraint): number {
    let depth = 0;
    if (constraint.parentConstraint !== null) {
      depth++;
      depth += this.depthOfConstraint(constraint.parentConstraint);
    }
    return depth;
  }

  constructor(private treeNodeService: TreeNodeService,
              private studyService: StudyService,
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
    this.loadStudiesConstraints();
    // create the pedigree-related constraints
    this.loadPedigrees();
    // construct concepts from loading the tree nodes
    this.loadCountMaps()
      .then(() => {
        this.treeNodeService.load();
      })
      .catch(err => {
        console.error(err);
      });
    this.subscribeToVariableChanges();
  }

  private loadEmptyConstraints() {
    this.allConstraints.push(new CombinationConstraint());
    this.allConstraints.push(new StudyConstraint());
    this.allConstraints.push(new ConceptConstraint());
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

  private subscribeToVariableChanges() {
    // When the selectedConceptCountMap is updated and the tree is finished loading,
    // update the corresponding variable categorised list and sub-tree
    Observable.combineLatest(
      this.selectedConceptCountMapUpdated.asObservable(),
      this.treeNodeService.treeNodesUpdated.asObservable()
    ).subscribe(res => {
      const isTreeLoadingFinished = res[1];
      if (isTreeLoadingFinished) {
        this.updateVariables();
      }
    });

    // when the variables and sub-tree are updated,
    // check all variables and tree nodes, categorise the variables, be ready for visual rendering
    this.variablesUpdated.asObservable()
      .subscribe((variables: Concept[]) => {
        this.checkAllVariables(true);
        this.categorizeVariables();
      });

    // when the user (un)selects / (un)checks tree nodes in the tree view,
    // update selected variables in the category view
    this.treeNodeService.selectedVariablesTreeDataUpdated.asObservable()
      .subscribe((selectedNodes: TreeNode[]) => {
        const codes = [];
        selectedNodes.forEach((n: TreeNode) => {
          const code = n['conceptCode'];
          if (this.isVariableNode(n.type) && code && !codes.includes(code)) {
            codes.push(code);
          }
        });
        this.variables.forEach((v: Concept) => {
          v.selected = codes.includes(v.code);
        });
      });

    // when the user (un)selects / (un)checks variables in the category view,
    // update the selected tree nodes in the tree view
    this.selectedVariablesUpdated.asObservable()
      .subscribe((variables: Concept[]) => {
        const codes = variables.map((v: Concept) => {
          return v.code;
        });
        this.treeNodeService.selectVariablesTreeDataByFields(
          this.treeNodeService.variablesTreeData, codes, ['conceptCode']);
      });
  }

  private categorizeVariables() {
    this.categorizedVariables.length = 0;
    this.variables.forEach((variable: Concept) => {
      let existingVariable = this.categorizedVariables.filter(x => x.type === variable.type)[0];
      if (existingVariable) {
        existingVariable.elements.push(variable);
      } else {
        this.categorizedVariables.push({type: variable.type, elements: [variable]});
      }
    });
  }

  public checkAllVariables(b: boolean) {
    // check the variables for the category view in gb-variables on the left panel
    this.variables.forEach((variable: Concept) => {
      variable.selected = b;
    });
    // check the variables for the tree view in gb-variables on the left panel
    this.treeNodeService.selectAllVariablesTreeData(b);
  }

  /*
   * ------------------------------------------------------------------------- countMap-related methods
   */
  loadCountMaps(): Promise<any> {
    return new Promise((resolve, reject) => {
      let promise1 = this.loadConceptCountMap();
      let promise2 = this.loadStudyCountMap();
      let promise3 = this.loadStudyConceptCountMap();
      Promise.all([promise1, promise2, promise3])
        .then(() => {
          resolve(true);
        })
        .catch((err) => {
          reject(err);
        })
    });
  }

  loadConceptCountMap(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.resourceService.getCountsPerConcept(new TrueConstraint())
        .subscribe((map: Map<string, CountItem>) => {
          this.conceptCountMap = map;
          resolve(true);
        }, (err: HttpErrorResponse) => {
          ErrorHelper.handleError(err);
          reject('Fail to load concept count map from server.');
        });
    });
  }

  loadStudyCountMap(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.resourceService.getCountsPerStudy(new TrueConstraint())
        .subscribe((map: Map<string, CountItem>) => {
          this.studyCountMap = map;
          resolve(true);
        }, (err: HttpErrorResponse) => {
          ErrorHelper.handleError(err);
          reject('Fail to load study count map from server.');
        });
    });
  }

  loadStudyConceptCountMap(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.resourceService.getCountsPerStudyAndConcept(new TrueConstraint())
        .subscribe((map: Map<string, Map<string, CountItem>>) => {
          this.studyConceptCountMap = map;
          resolve(true);
        }, (err: HttpErrorResponse) => {
          ErrorHelper.handleError(err);
          reject('Fail to load study-concept count map from server.');
        });
    });
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
   * Generate the constraint for retrieving the patients with only the inclusion criteria
   * @returns {Constraint}
   */
  public inclusionConstraint(): Constraint {
    let inclusionConstraint: Constraint = <Constraint>this.rootInclusionConstraint;
    return ConstraintHelper.hasNonEmptyChildren(<CombinationConstraint>inclusionConstraint) ?
      inclusionConstraint : new TrueConstraint();
  }

  public hasExclusionConstraint(): Boolean {
    return ConstraintHelper.hasNonEmptyChildren(this.rootExclusionConstraint);
  }

  /**
   * Generate the constraint for retrieving the patients with the exclusion criteria,
   * but also in the inclusion set
   * @returns {CombinationConstraint}
   */
  public exclusionConstraint(): Constraint {
    if (this.hasExclusionConstraint()) {
      // Inclusion part, which is what the exclusion count is calculated from
      let inclusionConstraint = this.inclusionConstraint();
      let exclusionConstraint = <Constraint>this.rootExclusionConstraint;

      let combination = new CombinationConstraint();
      combination.addChild(inclusionConstraint);
      combination.addChild(exclusionConstraint);
      return combination;
    } else {
      return undefined;
    }
  }

  /**
   * Get the constraint intersected on 'inclusion' and 'not exclusion' constraints
   * @returns {Constraint}
   */
  public cohortConstraint(): Constraint {
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
   * Clear the patient constraints
   */
  public clearCohortConstraint() {
    this.rootInclusionConstraint.children.length = 0;
    this.rootExclusionConstraint.children.length = 0;
  }

  public restoreCohortConstraint(constraint: Constraint) {
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
        this.restoreCohortConstraint(remainingConstraint);
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

  public isVariableNode(treeNodeType: string): boolean {
    return (treeNodeType === 'NUMERIC' ||
      treeNodeType === 'CATEGORICAL' ||
      treeNodeType === 'CATEGORICAL_OPTION' ||
      treeNodeType === 'DATE' ||
      treeNodeType === 'HIGH_DIMENSIONAL' ||
      treeNodeType === 'TEXT')
  }

  /**
   * Generate the constraint based on the variables selected in the Variables panel
   */
  public variableConstraint(): Constraint {
    if (this.variablesViewMode === VariablesViewMode.TREE_VIEW) {
      return this.generateVariablesTreeConstraint();
    } else if (this.variablesViewMode === VariablesViewMode.CATEGORIZED_VIEW) {
      return this.generateCategorizedVariablesConstraint();
    } else {
      return new TrueConstraint();
    }
  }

  /**
   * Generate the constraint based on the variables selected in the category view of the variables panel
   * @returns {Constraint}
   */
  private generateCategorizedVariablesConstraint(): Constraint {
    const hasUnselected = this.variables.some((variable: Concept) => {
      return !variable.selected;
    });
    if (hasUnselected) {
      let result: CombinationConstraint = new CombinationConstraint();
      result.combinationState = CombinationState.Or;
      result.mark = ConstraintMark.OBSERVATION;
      this.variables
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
   * Generate the constraint based on the variables selected in the tree view of the variables panel
   * @returns {Constraint}
   */
  private generateVariablesTreeConstraint(): Constraint {
    let constraint = null;
    let selectedTreeNodes = this.treeNodeService.selectedVariablesTreeData;
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
  public generateConstraintFromTreeNode(selectedNode: TreeNode): Constraint {
    let constraint: Constraint = null;
    let treeNode = selectedNode;
    let treeNodeType = treeNode['type'];
    if (treeNodeType === 'STUDY') {
      let study: Study = new Study();
      study.id = treeNode['constraint']['studyId'];
      constraint = new StudyConstraint();
      (<StudyConstraint>constraint).studies.push(study);
    } else if (this.isVariableNode) {
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

  public identifyDraggedElement(): Concept {
    if (this.draggedVariable) {
      const draggedVariable = this.draggedVariable.copy();
      this.draggedVariable = null;
      return draggedVariable;
    } else if (this.treeNodeService.selectedTreeNode) {
      return this.treeNodeService.getConceptFromTreeNode(this.treeNodeService.selectedTreeNode);
    }
    return null;
  }


  /*
   * ------------------------------------------------------------------------- variables-related methods
   */
  public updateVariables(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.isUpdatingVariables = true;
      if (this.isTreeNodesLoading) {
        window.setTimeout((function () {
          this.updateVariables(resolve);
        }).bind(this), 500);
      } else {
        this.variables.length = 0;
        const codes: Array<string> = Array.from(this.selectedConceptCountMap.keys());
        this.concepts.forEach((concept: Concept) => {
          if (codes.includes(concept.code)) {
            concept.counts = this.selectedConceptCountMap.get(concept.code);
            this.variables.push(concept);
          }
        });
        this.variablesUpdated.next(this.variables);
        this.treeNodeService
          .updateVariablesTreeData(
            this.selectedStudyConceptCountMap,
            this.selectedConceptCountMap,
            this.selectedStudyCountMap);
        this.isUpdatingVariables = false;
        resolve(true);
      }
    });
  }

  importVariablesByNames(names: string[]) {
    if (this.variablesViewMode === VariablesViewMode.TREE_VIEW) {
      return this.treeNodeService.selectVariablesTreeDataByFields(
        this.treeNodeService.variablesTreeData, names, ['metadata', 'item_name']);
    } else if (this.variablesViewMode === VariablesViewMode.CATEGORIZED_VIEW) {
      return this.selectVariablesByProperty(names, 'name');
    }
  }

  importVariablesByPaths(paths: string[]) {
    if (this.variablesViewMode === VariablesViewMode.TREE_VIEW) {
      return this.treeNodeService.selectVariablesTreeDataByFields(
        this.treeNodeService.variablesTreeData, paths, ['fullName']);
    } else if (this.variablesViewMode === VariablesViewMode.CATEGORIZED_VIEW) {
      return this.selectVariablesByProperty(paths, 'path');
    }
  }

  selectVariablesByProperty(values: string[], property: string) {
    this.variables.forEach((c: Concept) => {
      if (values.includes(c[property])) {
        c.selected = true;
      }
    });
  }

  /*
   * ------------------------------------------------------------------------- getters and setters
   */

  // get the combination of cohort constraint and variable constraint
  get combination(): CombinationConstraint {
    return new CombinationConstraint(
      [this.cohortConstraint(), this.variableConstraint()],
      CombinationState.And,
      ConstraintMark.OBSERVATION
    );
  }

  get isTreeNodesLoading(): boolean {
    return !this.treeNodeService.isTreeNodesLoadingCompleted;
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

  get variables(): Concept[] {
    return this._variables;
  }

  set variables(value: Concept[]) {
    this._variables = value;
  }

  get conceptCountMap(): Map<string, CountItem> {
    return this._conceptCountMap;
  }

  set conceptCountMap(value: Map<string, CountItem>) {
    this._conceptCountMap = value;
  }

  get studyCountMap(): Map<string, CountItem> {
    return this._studyCountMap;
  }

  set studyCountMap(value: Map<string, CountItem>) {
    this._studyCountMap = value;
  }

  get studyConceptCountMap(): Map<string, Map<string, CountItem>> {
    return this._studyConceptCountMap;
  }

  set studyConceptCountMap(value: Map<string, Map<string, CountItem>>) {
    this._studyConceptCountMap = value;
  }

  get selectedConceptCountMap(): Map<string, CountItem> {
    return this._selectedConceptCountMap;
  }

  set selectedConceptCountMap(value: Map<string, CountItem>) {
    this._selectedConceptCountMap = value;
    this.selectedConceptCountMapUpdated.next(value);
  }

  get selectedConceptCountMapUpdated(): Subject<Map<string, CountItem>> {
    return this._selectedConceptCountMapUpdated;
  }

  set selectedConceptCountMapUpdated(value: Subject<Map<string, CountItem>>) {
    this._selectedConceptCountMapUpdated = value;
  }

  get selectedStudyCountMap(): Map<string, CountItem> {
    return this._selectedStudyCountMap;
  }

  set selectedStudyCountMap(value: Map<string, CountItem>) {
    this._selectedStudyCountMap = value;
  }

  get selectedStudyConceptCountMap(): Map<string, Map<string, CountItem>> {
    return this._selectedStudyConceptCountMap;
  }

  set selectedStudyConceptCountMap(value: Map<string, Map<string, CountItem>>) {
    this._selectedStudyConceptCountMap = value;
  }

  get variablesUpdated(): Subject<Concept[]> {
    return this._variablesUpdated;
  }

  set variablesUpdated(value: Subject<Concept[]>) {
    this._variablesUpdated = value;
  }

  get categorizedVariables(): Array<CategorizedVariable> {
    return this._categorizedVariables;
  }

  set categorizedVariables(value: Array<CategorizedVariable>) {
    this._categorizedVariables = value;
  }

  get isUpdatingVariables(): boolean {
    return this._isUpdatingVariables;
  }

  set isUpdatingVariables(value: boolean) {
    this._isUpdatingVariables = value;
  }

  get draggedVariable(): Concept {
    return this._draggedVariable;
  }

  set draggedVariable(value: Concept) {
    this._draggedVariable = value;
  }

  get variablesViewMode(): VariablesViewMode {
    return this._variablesViewMode;
  }

  set variablesViewMode(value: VariablesViewMode) {
    this._variablesViewMode = value;
  }

  get selectedVariablesUpdated(): Subject<Concept[]> {
    return this._selectedVariablesUpdated;
  }

  set selectedVariablesUpdated(value: Subject<Concept[]>) {
    this._selectedVariablesUpdated = value;
  }
}
