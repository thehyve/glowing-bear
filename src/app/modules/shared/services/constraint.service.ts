import {Injectable} from '@angular/core';
import {CombinationConstraint} from '../models/constraints/combination-constraint';
import {ResourceService} from './resource.service';
import {Constraint} from '../models/constraints/constraint';
import {TrueConstraint} from '../models/constraints/true-constraint';
import {PatientSetPostResponse} from '../models/patient-set-post-response';
import {StudyConstraint} from '../models/constraints/study-constraint';
import {Study} from '../models/study';
import {Concept} from '../models/concept';
import {ConceptConstraint} from '../models/constraints/concept-constraint';
import {CombinationState} from '../models/constraints/combination-state';
import {NegationConstraint} from '../models/constraints/negation-constraint';
import {DropMode} from '../models/drop-mode';
import {DimensionRegistryService} from './dimension-registry.service';

type LoadingState = 'loading' | 'complete';

@Injectable()
export class ConstraintService {

  /*
   * The patient count variables and criterion constraints
   * in the patient-selection accordion in data-selection
   */
  private _patientCount = 0;
  private _inclusionPatientCount = 0;
  private _exclusionPatientCount = 0;
  private _patientSetPostResponse: PatientSetPostResponse;
  private _rootInclusionConstraint: CombinationConstraint;
  private _rootExclusionConstraint: CombinationConstraint;

  loadingStateInclusion: LoadingState = 'complete';
  loadingStateExclusion: LoadingState = 'complete';
  loadingStateTotal: LoadingState = 'complete';

  /*
   * The selected node (drag-start) in the side-panel of either
   * (1) the tree
   * (2) the patient sets
   * or (3) the observation sets
   */
  private _selectedNode: any = null;
  private _validTreeNodeTypes: string[] = [];


  constructor(private resourceService: ResourceService,
              private dimensionReistryService: DimensionRegistryService) {
    this._rootInclusionConstraint = new CombinationConstraint();
    this._rootExclusionConstraint = new CombinationConstraint();
    this._validTreeNodeTypes = [
      'NUMERIC',
      'CATEGORICAL_OPTION',
      'STUDY'
    ];
  }

  update() {
    this.updatePatients();
  }

  updatePatients() {
    this.loadingStateInclusion = 'loading';
    this.loadingStateExclusion = 'loading';
    this.loadingStateTotal = 'loading';

    /*
     * Inclusion constraint patient count
     */
    let inclusionConstraint = this.generateInclusionConstraint(this.rootInclusionConstraint);
    this.resourceService.getPatients(inclusionConstraint, 'Inclusion')
      .subscribe(
        patients => {
          this.inclusionPatientCount = patients.length;
          this.loadingStateInclusion = 'complete';
        },
        err => {
          console.error(err);
          this.loadingStateInclusion = 'complete';
        }
      );

    /*
     * Exclusion constraint patient count
     */
    // Only execute the exclusion constraint if it has non-empty children
    if ((<CombinationConstraint>this.rootExclusionConstraint).hasNonEmptyChildren()) {
      let exclusionConstraint =
        this.generateExclusionConstraint(this.rootInclusionConstraint, this.rootExclusionConstraint);
      this.resourceService.getPatients(exclusionConstraint, 'Exclusion')
        .subscribe(
          patients => {
            this.exclusionPatientCount = patients.length;
            this.loadingStateExclusion = 'complete';
          },
          err => {
            console.error(err);
            this.loadingStateExclusion = 'complete';
          }
        );
    } else {
      this.exclusionPatientCount = 0;
      this.loadingStateExclusion = 'complete';
    }

    /*
     * Intersection constraint patient count
     */
    let intersectionConstraint: Constraint =
      this.generateIntersectionConstraint(this.rootInclusionConstraint, this.rootExclusionConstraint);
    this.resourceService.getPatients(intersectionConstraint, 'Intersection')
      .subscribe(
        patients => {
          this.patientCount = patients.length;
          this.loadingStateTotal = 'complete';
        },
        err => {
          console.error(err);
          this.loadingStateTotal = 'complete';
        }
      );
  }

  /**
   * Generate the constraint for the intersection between
   * the inclusion constraint and the negated exclusion constraint
   * @param inclusionConstraint
   * @param exclusionConstraint
   * @returns {CombinationConstraint}
   */
  generateIntersectionConstraint(inclusionConstraint: Constraint,
                                 exclusionConstraint: Constraint): Constraint {

    // Inclusion part
    if (!(<CombinationConstraint>inclusionConstraint).hasNonEmptyChildren()) {
      inclusionConstraint = new TrueConstraint();
    }

    // Only use exclusion if there's something there
    if ((<CombinationConstraint>exclusionConstraint).hasNonEmptyChildren()) {
      // Wrap exclusion in negation
      let negatedExclusionConstraint = new NegationConstraint(exclusionConstraint);

      let combination = new CombinationConstraint();
      combination.children.push(inclusionConstraint);
      combination.children.push(negatedExclusionConstraint);
      return combination;
    } else {
      // Otherwise just return the inclusion part
      return inclusionConstraint;
    }
  }

  /**
   * Generate the constraint for retrieving the patients with only the inclusion criteria
   * @param inclusionConstraint
   * @returns {TrueConstraint|Constraint}
   */
  generateInclusionConstraint(inclusionConstraint: Constraint): Constraint {
    return !(<CombinationConstraint>inclusionConstraint).hasNonEmptyChildren() ?
      new TrueConstraint() : inclusionConstraint;
  }

  /**
   * Generate the constraint for retrieving the patients with the exclusion criteria,
   * but also in the inclusion set
   * @param inclusionConstraint
   * @param exclusionConstraint
   * @returns {CombinationConstraint}
   */
  generateExclusionConstraint(inclusionConstraint: Constraint, exclusionConstraint: Constraint): Constraint {
    // Inclusion part, which is what the exclusion count is calculated from
    inclusionConstraint = this.generateInclusionConstraint(inclusionConstraint);

    let combination = new CombinationConstraint();
    combination.children.push(inclusionConstraint);
    combination.children.push(exclusionConstraint);
    return combination;
  }

  generateConstraintFromSelectedNode(): Constraint {
    let constraint: Constraint = null;
    let dropMode: DropMode = this.selectedNode['dropMode'];
    // if the dropped node is a tree node
    if (dropMode === DropMode.TreeNode) {
      let treeNode = this.selectedNode;
      let treeNodeType = treeNode['type'];
      if (treeNodeType === 'STUDY') {
        let study: Study = new Study();
        study.studyId = treeNode['constraint']['studyId'];
        constraint = new StudyConstraint();
        (<StudyConstraint>constraint).studies.push(study);
      } else if (treeNodeType === 'NUMERIC' ||
        treeNodeType === 'CATEGORICAL_OPTION') {
        let concept = new Concept();
        if (treeNode['constraint']) {
          let constraintObject = treeNode['constraint'];
          constraintObject['valueType'] = treeNodeType;
          constraint = this.generateConstraintFromConstraintObject(constraintObject);
        } else {
          concept.path = treeNode['conceptPath'];
          concept.type = treeNodeType;
          constraint = new ConceptConstraint();
          (<ConceptConstraint>constraint).concept = concept;
        }
      }
    } else if (dropMode === DropMode.PatientSet) { // if the dropped node is a patient set
      if (this.selectedNode.requestConstraints) {
        let constraintObject = JSON.parse(this.selectedNode.requestConstraints);
        constraintObject = this.optimizeConstraintObject(constraintObject);
        constraint = this.generateConstraintFromConstraintObject(constraintObject);
      }
    } else if (dropMode === DropMode.ObservationSet) {
    }

    return constraint;
  }

  generateConstraintFromConstraintObject(constraintObject): Constraint {
    let type = constraintObject['type'];
    let constraint: Constraint = null;
    if (type === 'concept') {
      let concept = new Concept();
      concept.path = constraintObject['path'];
      concept.type = constraintObject['valueType'];
      constraint = new ConceptConstraint();
      (<ConceptConstraint>constraint).concept = concept;
    } else if (type === 'study_name') {
      let study = new Study();
      study.studyId = constraintObject['studyId'];
      constraint = new StudyConstraint();
      (<StudyConstraint>constraint).studies.push(study);
    } else if (type === 'combination') {
      let operator = constraintObject['operator'];
      constraint = new CombinationConstraint();
      (<CombinationConstraint>constraint).combinationState =
        (operator === 'and') ? CombinationState.And : CombinationState.Or;
      for (let arg of constraintObject['args']) {
        if (arg['type'] === 'concept') {
          arg['valueType'] = constraintObject['valueType'];
        }
        let child = this.generateConstraintFromConstraintObject(arg);
        (<CombinationConstraint>constraint).children.push(child);
      }
    } else if (type === 'and' || type === 'or') {
      let operator = type;
      constraint = new CombinationConstraint();
      (<CombinationConstraint>constraint).combinationState =
        (operator === 'and') ? CombinationState.And : CombinationState.Or;
      for (let arg of constraintObject['args']) {
        let child = this.generateConstraintFromConstraintObject(arg);
        (<CombinationConstraint>constraint).children.push(child);
      }
    }

    return constraint;
  }

  optimizeConstraintObject(constraintObject) {
    let newConstraintObject = constraintObject;

    // if the object has 'args' property
    if (constraintObject['args']) {
      if (constraintObject['args'].length === 1) {
        newConstraintObject = this.optimizeConstraintObject(constraintObject['args'][0]);
      } else if (constraintObject['args'].length > 1) {
        let newArgs = [];
        for (let arg of constraintObject['args']) {
          let newArg = this.optimizeConstraintObject(arg);
          newArgs.push(newArg);
        }
        newConstraintObject['args'] = newArgs;
      }
    } else if (constraintObject['constraint']) { // if the object has the 'constraint' property
      newConstraintObject = this.optimizeConstraintObject(constraintObject['constraint']);
    }

    return newConstraintObject;
  }

  savePatients(patientSetName: string) {
    // derive the intersection constraint
    let intersectionConstraint =
      this.generateIntersectionConstraint(this.rootInclusionConstraint, this.rootExclusionConstraint);

    // call the backend api to save patient set of that constraint
    // and update the dimension registry service for the patient set list
    this.resourceService.savePatients(patientSetName, intersectionConstraint)
      .subscribe(
        result => {
          this._patientSetPostResponse = result;
          this.dimensionReistryService.updatePatientSets();
        },
        err => {
          console.error(err);
        }
      );
  }

  get patientCount(): number {
    return this._patientCount;
  }

  set patientCount(value: number) {
    this._patientCount = value;
  }

  get inclusionPatientCount(): number {
    return this._inclusionPatientCount;
  }

  set inclusionPatientCount(value: number) {
    this._inclusionPatientCount = value;
  }

  get exclusionPatientCount(): number {
    return this._exclusionPatientCount;
  }

  set exclusionPatientCount(value: number) {
    this._exclusionPatientCount = value;
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

  get patientSetPostResponse(): PatientSetPostResponse {
    return this._patientSetPostResponse;
  }

  set patientSetPostResponse(value: PatientSetPostResponse) {
    this._patientSetPostResponse = value;
  }

  get selectedNode(): any {
    return this._selectedNode;
  }

  set selectedNode(value: any) {
    this._selectedNode = value;
  }

  get validTreeNodeTypes(): string[] {
    return this._validTreeNodeTypes;
  }

  set validTreeNodeTypes(value: string[]) {
    this._validTreeNodeTypes = value;
  }

}
