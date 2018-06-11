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
import {TimeConstraint} from '../models/constraint-models/time-constraint';
import {TrialVisitConstraint} from '../models/constraint-models/trial-visit-constraint';
import {TrialVisit} from '../models/constraint-models/trial-visit';
import {ValueConstraint} from '../models/constraint-models/value-constraint';
import {ResourceService} from './resource.service';
import {ConceptType} from '../models/constraint-models/concept-type';
import {TreeNode} from 'primeng/api';
import {AuthenticationService} from './authentication/authentication.service';

/**
 * This service concerns with
 * (1) translating string or JSON objects into Constraint class instances
 * (2) clear or restore constraints
 */
@Injectable()
export class ConstraintService {

  private _rootInclusionConstraint: CombinationConstraint;
  private _rootExclusionConstraint: CombinationConstraint;
  // the subject-set constraint used to replace the constraint in step 1 to boost performance
  private _subjectSetConstraint: SubjectSetConstraint;

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

  constructor(private treeNodeService: TreeNodeService,
              private resourceService: ResourceService,
              private authenticationService: AuthenticationService) {
    // Initialize the root inclusion and exclusion constraints in the 1st step
    this.rootInclusionConstraint = new CombinationConstraint();
    this.rootInclusionConstraint.isRoot = true;
    this.rootExclusionConstraint = new CombinationConstraint();
    this.rootExclusionConstraint.isRoot = true;
    this.subjectSetConstraint = null;

    // Initialize the root inclusion and exclusion constraints in the 1st step
    this.rootInclusionConstraint = new CombinationConstraint();
    this.rootInclusionConstraint.isRoot = true;
    this.rootInclusionConstraint.isSubselection = true;
    this.rootExclusionConstraint = new CombinationConstraint();
    this.rootExclusionConstraint.isRoot = true;
    this.rootExclusionConstraint.isSubselection = true;
  }

  init() {
    console.log('Initialise constraint service ...');
    // Construct constraints
    this.loadEmptyConstraints();
    this.loadStudies();
    // create the pedigree-related constraints
    this.loadPedigrees();
    // also construct concepts while loading the tree nodes
    this.treeNodeService.loadTreeNodes(this);
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
    this.resourceService.getPedigreeRelationTypes()
      .subscribe(
        relationTypeObjects => {
          for (let obj of relationTypeObjects) {
            let pedigreeConstraint = new PedigreeConstraint(obj.label);
            pedigreeConstraint.description = obj.description;
            pedigreeConstraint.biological = obj.biological;
            pedigreeConstraint.symmetrical = obj.symmetrical;
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
   * @param inclusionConstraint
   * @returns {TrueConstraint|Constraint}
   */
  public generateInclusionConstraint(): Constraint {
    let inclusionConstraint: Constraint = <Constraint>this.rootInclusionConstraint;
    return (<CombinationConstraint>inclusionConstraint).hasNonEmptyChildren() ?
      inclusionConstraint : new TrueConstraint();
  }

  public hasExclusionConstraint(): Boolean {
    return this.rootExclusionConstraint.hasNonEmptyChildren();
  }

  /**
   * In the 1st step,
   * Generate the constraint for retrieving the patients with the exclusion criteria,
   * but also in the inclusion set
   * @returns {CombinationConstraint}
   */
  public generateExclusionConstraint(): Constraint {
    // Inclusion part, which is what the exclusion count is calculated from
    let inclusionConstraint = this.generateInclusionConstraint();
    let exclusionConstraint = <Constraint>this.rootExclusionConstraint;

    let combination = new CombinationConstraint();
    combination.addChild(inclusionConstraint);
    combination.addChild(exclusionConstraint);
    return combination;
  }

  public constraint_1() {
    return this.subjectSetConstraint ? this.subjectSetConstraint : this.generateSelectionConstraint();
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
    if (!(<CombinationConstraint>inclusionConstraint).hasNonEmptyChildren()) {
      inclusionConstraint = new TrueConstraint();
      trueInclusion = true;
    }

    // Only use exclusion if there's something there
    if ((<CombinationConstraint>exclusionConstraint).hasNonEmptyChildren()) {
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
    resultConstraint.isSubselection = true;
    return resultConstraint;
  }

  /**
   * Clear the patient constraints
   */
  public clearSelectionConstraint() {
    this.rootInclusionConstraint.children.length = 0;
    this.rootExclusionConstraint.children.length = 0;
  }

  public restoreSelectionConstraint(constraint: Constraint) {
    if (constraint.getClassName() === 'CombinationConstraint') { // If it is a combination constraint
      const children = (<CombinationConstraint>constraint).children;
      let hasNegation = children.length === 2
        && (children[1].getClassName() === 'NegationConstraint' || children[0].getClassName() === 'NegationConstraint');
      if (hasNegation) {
        let negationConstraint =
          <NegationConstraint>(children[1].getClassName() === 'NegationConstraint' ? children[1] : children[0]);
        this.rootExclusionConstraint.addChild(negationConstraint.constraint);
        let remainingConstraint =
          <NegationConstraint>(children[0].getClassName() === 'NegationConstraint' ? children[1] : children[0]);
        this.restoreSelectionConstraint(remainingConstraint);
      } else {
        for (let child of children) {
          this.rootInclusionConstraint.addChild(child);
        }
        this.rootInclusionConstraint.combinationState = (<CombinationConstraint>constraint).combinationState;
      }
    } else if (constraint.getClassName() === 'NegationConstraint') {
      this.rootExclusionConstraint.addChild((<NegationConstraint>constraint).constraint);
    } else if (constraint.getClassName() !== 'TrueConstraint') {
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
        const leafConstraint = this.generateConstraintFromConstraintObject(leaf['constraint']);
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
        study.studyId = treeNode['constraint']['studyId'];
        constraint = new StudyConstraint();
        (<StudyConstraint>constraint).studies.push(study);
      } else if (treeNodeType === 'NUMERIC' ||
        treeNodeType === 'CATEGORICAL' ||
        treeNodeType === 'DATE' ||
        treeNodeType === 'HIGH_DIMENSIONAL' ||
        treeNodeType === 'TEXT') {
        if (treeNode['constraint']) {
          constraint = this.generateConstraintFromConstraintObject(treeNode['constraint']);
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

  // generate the constraint instance based on given constraint object input
  public generateConstraintFromConstraintObject(constraintObjectInput: object): Constraint {
    let constraintObject = this.optimizeConstraintObject(constraintObjectInput);
    let type = constraintObject['type'];
    let constraint: Constraint = null;
    if (type === 'concept') { // ------------------------------------> If it is a concept constraint
      constraint = new ConceptConstraint();
      let concept = new Concept();
      const tail = '\\' + constraintObject['name'] + '\\';
      const fullName = constraintObject['fullName'];
      concept.fullName = fullName;
      let head = fullName.substring(0, fullName.length - tail.length);
      concept.name = constraintObject['name'];
      concept.label = constraintObject['name'] + ' (' + head + ')';
      concept.path = constraintObject['conceptPath'];
      concept.type = constraintObject['valueType'];
      concept.code = constraintObject['conceptCode'];
      (<ConceptConstraint>constraint).concept = concept;
    } else if (type === 'study_name') { // ----------------------------> If it is a study constraint
      let study = new Study();
      study.studyId = constraintObject['studyId'];
      constraint = new StudyConstraint();
      (<StudyConstraint>constraint).studies.push(study);
    } else if (type === 'and' ||
      type === 'or' ||
      type === 'combination') { // ------------------------------> If it is a combination constraint
      let operator = type !== 'combination' ? type : constraintObject['operator'];
      constraint = new CombinationConstraint();
      (<CombinationConstraint>constraint).combinationState =
        (operator === 'and') ? CombinationState.And : CombinationState.Or;

      /*
       * sometimes a combination constraint actually corresponds to a concept constraint UI
       * which could have:
       * a) an observation date constraint and/or
       * b) a trial-visit constraint and/or
       * c) value constraints and/or
       * d) time constraints (value date for a DATE concept and/or observation date constraints)
       * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
       * sometimes a combination contains purely study constraints,
       * in which case we can reduce this combination to a single study constraint containing multiple studies
       */
      let prospectConcept: ConceptConstraint = null;
      let prospectValDate: TimeConstraint = null;
      let prospectObsDate: TimeConstraint = null;
      let prospectTrialVisit: TrialVisitConstraint = null;
      let prospectValues: ValueConstraint[] = [];
      let hasOnlyStudies = true;
      let allStudyIds = [];
      /*
       * go through each argument, construct potential sub-constraints for the concept constraint
       */
      for (let arg of constraintObject['args']) {
        if (arg['type'] === 'concept' && !arg['fullName']) {
          arg['valueType'] = constraintObject['valueType'];
          arg['conceptPath'] = constraintObject['conceptPath'];
          arg['name'] = constraintObject['name'];
          arg['fullName'] = constraintObject['fullName'];
          arg['conceptCode'] = constraintObject['conceptCode'];
        }
        let child = this.generateConstraintFromConstraintObject(arg);
        if (arg['type'] === 'concept') {
          prospectConcept = <ConceptConstraint>child;
        } else if (arg['type'] === 'time') {
          if (arg['isObservationDate']) {
            prospectObsDate = <TimeConstraint>child;
            prospectObsDate.isNegated = arg['isNegated'];
          } else {
            prospectValDate = <TimeConstraint>child;
            prospectValDate.isNegated = arg['isNegated'];
          }
        } else if (arg['type'] === 'field') {
          prospectTrialVisit = <TrialVisitConstraint>child;
        } else if (arg['type'] === 'value') {
          prospectValues.push(<ValueConstraint>child);
        } else if (arg['type'] === 'or') {
          let isValues = true;
          for (let val of (<CombinationConstraint>child).children) {
            if (val.getClassName() !== 'ValueConstraint') {
              isValues = false;
            } else {
              prospectValues.push(<ValueConstraint>val);
            }
          }
          if (!isValues) {
            prospectValues = [];
          }
        } else if (arg['type'] === 'negation') {
          let negationArg = arg['arg'];
          if (negationArg['type'] === 'time') {
            if (negationArg['isObservationDate']) {
              prospectObsDate = <TimeConstraint>((<NegationConstraint>child).constraint);
              prospectObsDate.isNegated = true;
            } else {
              prospectValDate = <TimeConstraint>((<NegationConstraint>child).constraint);
              prospectValDate.isNegated = true;
            }
          }
        }
        (<CombinationConstraint>constraint).addChild(child);
        if (arg['type'] === 'study_name') {
          allStudyIds.push(arg['studyId']);
        } else {
          hasOnlyStudies = false;
        }
      }
      // -------------------------------- end for -------------------------------------------

      /*
       * Check conditions for a concept constraint
       */
      if (prospectConcept &&
        (prospectValDate || prospectObsDate || prospectTrialVisit || prospectValues.length > 0)) {
        if (prospectValDate) {
          prospectConcept.applyValDateConstraint = true;
          prospectConcept.valDateConstraint = prospectValDate;
        }
        if (prospectObsDate) {
          prospectConcept.applyObsDateConstraint = true;
          prospectConcept.obsDateConstraint = prospectObsDate;
        }
        if (prospectTrialVisit) {
          prospectConcept.applyTrialVisitConstraint = true;
          prospectConcept.trialVisitConstraint = prospectTrialVisit;
        }
        if (prospectValues) {
          prospectConcept.values = prospectValues;
        }
        constraint = prospectConcept;
      }
      /*
       * Check conditions for a study constraint
       */
      if (type === 'or' && hasOnlyStudies) {
        let studyConstraint = new StudyConstraint();
        for (let sid of allStudyIds) {
          let study = new Study();
          study.studyId = sid;
          studyConstraint.studies.push(study);
        }
        (<CombinationConstraint>constraint).children.length = 0;
        (<CombinationConstraint>constraint).addChild(studyConstraint);
      }
    } else if (type === 'relation') { // ---------------------------> If it is a pedigree constraint
      constraint = new PedigreeConstraint(constraintObject['relationTypeLabel']);
      (<PedigreeConstraint>constraint).biological = constraintObject['biological'];
      (<PedigreeConstraint>constraint).symmetrical = constraintObject['symmetrical'];
      let rightHandSide =
        this.generateConstraintFromConstraintObject(constraintObject['relatedSubjectsConstraint']);
      (<PedigreeConstraint>constraint).rightHandSideConstraint.children.length = 0;
      if (rightHandSide.getClassName() === 'CombinationConstraint') {
        (<PedigreeConstraint>constraint).rightHandSideConstraint = <CombinationConstraint>rightHandSide;
        for (let child of (<CombinationConstraint>rightHandSide).children) {
          (<PedigreeConstraint>constraint).rightHandSideConstraint.addChild(child);
        }
      } else {
        if (rightHandSide.getClassName() !== 'TrueConstraint') {
          (<PedigreeConstraint>constraint).rightHandSideConstraint.addChild(rightHandSide);
        }
      }
    } else if (type === 'time') { // -----------------------------------> If it is a time constraint
      constraint = new TimeConstraint(constraintObject['operator']);
      (<TimeConstraint>constraint).date1 = new Date(constraintObject['values'][0]);
      if (constraintObject['values'].length === 2) {
        (<TimeConstraint>constraint).date2 = new Date(constraintObject['values'][1]);
      }
      (<TimeConstraint>constraint).isNegated = constraintObject['isNegated'];
      (<TimeConstraint>constraint).isObservationDate = constraintObject['isObservationDate'];
    } else if (type === 'field') { // ---------------------------> If it is a trial-visit constraint
      constraint = new TrialVisitConstraint();
      for (let id of constraintObject['value']) {
        let visit = new TrialVisit(id);
        (<TrialVisitConstraint>constraint).trialVisits.push(visit);
      }
    } else if (type === 'value') {
      constraint = new ValueConstraint();
      (<ValueConstraint>constraint).operator = constraintObject['operator'];
      (<ValueConstraint>constraint).value = constraintObject['value'];
      (<ValueConstraint>constraint).valueType = constraintObject['valueType'];
    } else if (type === 'patient_set') { // ---------------------> If it is a patient-set constraint
      constraint = new SubjectSetConstraint();
      if (constraintObject['subjectIds']) {
        (<SubjectSetConstraint>constraint).subjectIds = constraintObject['subjectIds'];
      } else if (constraintObject['patientIds']) {
        (<SubjectSetConstraint>constraint).patientIds = constraintObject['patientIds'];
      } else if (constraintObject['patientSetId']) {
        (<SubjectSetConstraint>constraint).id = constraintObject['patientSetId'];
      }
    } else if (type === 'subselection'
      && constraintObject['dimension'] === 'patient') { // -------> If it is a patient sub-selection
      constraint = this.generateConstraintFromConstraintObject(constraintObject['constraint']);
    } else if (type === 'true') { // -----------------------------------> If it is a true constraint
      constraint = new TrueConstraint();
    } else if (type === 'negation') { // ---------------------------> If it is a negation constraint
      const childConstraint = this.generateConstraintFromConstraintObject(constraintObject['arg']);
      constraint = new NegationConstraint(childConstraint);
    }
    return constraint;
  }

  private optimizeConstraintObject(constraintObject) {
    let newConstraintObject = Object.assign({}, constraintObject);

    // if the object has 'args' property
    if (newConstraintObject['args']) {
      if (newConstraintObject['args'].length === 1) {
        newConstraintObject = this.optimizeConstraintObject(newConstraintObject['args'][0]);
      } else if (newConstraintObject['args'].length > 1) {
        let isOr = newConstraintObject['type'] === 'or';
        let hasTrue = false;
        let newArgs = [];
        for (let arg of newConstraintObject['args']) {
          if (arg['type'] === 'true') {
            hasTrue = true;
          } else {
            let newArg = this.optimizeConstraintObject(arg);
            if (newArg['type'] === 'true') {
              hasTrue = true;
            } else {
              newArgs.push(newArg);
            }
          }
        }
        if (isOr && hasTrue) {
          newConstraintObject['args'] = [];
        } else {
          newConstraintObject['args'] = newArgs;
        }
      }
    } else if (newConstraintObject['constraint']) { // if the object has the 'constraint' property
      newConstraintObject = this.optimizeConstraintObject(newConstraintObject['constraint']);
    }
    return newConstraintObject;
  }

  public depthOfConstraint(constraint: Constraint): number {
    let depth = 0;
    if (constraint.parent !== null) {
      depth++;
      depth += this.depthOfConstraint(constraint.parent);
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

  public isCategoricalConceptConstraint(constraint: Constraint): boolean {
    let result = false;
    if (constraint.getClassName() === 'ConceptConstraint') {
      let conceptConstraint = <ConceptConstraint>constraint;
      result = conceptConstraint.concept.type === ConceptType.CATEGORICAL;
    }
    return result;
  }

  get subjectSetConstraint(): SubjectSetConstraint {
    return this._subjectSetConstraint;
  }

  set subjectSetConstraint(value: SubjectSetConstraint) {
    this._subjectSetConstraint = value;
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
