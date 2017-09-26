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
import {TreeNode} from 'primeng/primeng';

type LoadingState = 'loading' | 'complete';

/**
 * This service concerns with
 * (1) translating string or JSON objects into Constraint class instances
 * (2) saving constraints as patient or observation sets
 * (3) updating relevant patient or observation counts
 */
@Injectable()
export class ConstraintService {

  /*
   * The patient count related variables and criterion constraints
   * in the patient-selection accordion in data-selection
   */
  private _patientCount = 0;
  private _inclusionPatientCount = 0;
  private _exclusionPatientCount = 0;
  private _patientSetPostResponse: PatientSetPostResponse;
  private _rootInclusionConstraint: CombinationConstraint;
  private _rootExclusionConstraint: CombinationConstraint;

  /*
   * The observation count related variables
   */
  private _observationCount = 0;
  private _conceptCount = 0;

  /*
   * The alert messages (for PrimeNg message UI) that informs the user
   * whether there is an error saving patient/observation set,
   * or the saving has been successful
   */
  private _alertMessages = [];

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
              private dimensionRegistryService: DimensionRegistryService) {
    this._rootInclusionConstraint = new CombinationConstraint();
    this._rootExclusionConstraint = new CombinationConstraint();
    this._validTreeNodeTypes = [
      'NUMERIC',
      'CATEGORICAL',
      'STUDY',
      'UNKNOWN'
    ];
  }

  public update() {
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

  generateConstraintFromSelectedNode(selectedNode: object, dropMode: DropMode): Constraint {
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
        treeNodeType === 'CATEGORICAL') {
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
      } else if (treeNodeType === 'UNKNOWN') {
        let descendants = [];
        this.dimensionRegistryService
          .getTreeNodeDescendantsWithExcludedTypes(selectedNode,
            ['UNKNOWN'], descendants);
        if (descendants.length < 6) {
          constraint = new CombinationConstraint();
          (<CombinationConstraint>constraint).combinationState = CombinationState.Or;
          for (let descendant of descendants) {
            let dConstraint = this.generateConstraintFromSelectedNode(descendant, DropMode.TreeNode);
            if (dConstraint) {
              (<CombinationConstraint>constraint).children.push(dConstraint);
            }
          }
          if ((<CombinationConstraint>constraint).children.length === 0) {
            constraint = null;
          }
        }
      }
    } else if (dropMode === DropMode.PatientSet) { // if the dropped node is a patient set
      if (selectedNode['requestConstraints']) {
        let constraintObject = JSON.parse(selectedNode['requestConstraints']);
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
    let name = patientSetName ? patientSetName.trim() : undefined;
    let duplicateName = false;
    let savedPatientSets = this.dimensionRegistryService.getPatientSets();
    for (let savedSet of savedPatientSets) {
      if (savedSet['name'] === name) {
        duplicateName = true;
        break;
      }
    }
    if (duplicateName) {
      this.alertMessages.push({severity: 'info', summary: 'Duplicate patient set name, choose a new name.', detail: ''});
    } else {
      this.alertMessages = [];
      // derive the intersection constraint
      let intersectionConstraint =
        this.generateIntersectionConstraint(this.rootInclusionConstraint, this.rootExclusionConstraint);

      // call the backend api to save patient set of that constraint
      // and update the dimension registry service for the patient set list
      this.resourceService.savePatients(patientSetName, intersectionConstraint)
        .subscribe(
          result => {
            this._patientSetPostResponse = result;
            this.dimensionRegistryService.updatePatientSets();
            let message = 'Your patient set ' + this.patientSetPostResponse.description +
              ' with ' + this.patientSetPostResponse.setSize + ' patients has been saved' +
              ' with the identifier: ' + this.patientSetPostResponse.id + '.';
            this.alertMessages.push({severity: 'info', summary: message, detail: ''});
          },
          err => {
            console.error(err);
            this.alertMessages.push({severity: 'info', summary: err, detail: ''});
          }
        );
    }
  }

  saveObservations(observationSetName: string) {}

  /**
   * Append a count element to the given treenode-content element
   * @param treeNodeContent
   * @param {number} count
   */
  private appendCountElement(treeNodeContent, count: number) {
    const countString = '(' + count + ')';
    let countElm = treeNodeContent.querySelector('.gb-count-element');
    if (countElm) {
      const oldCountString = countElm.textContent;
      if (countString !== oldCountString) {
        treeNodeContent.removeChild(countElm);
        countElm = document.createElement('span');
        countElm.classList.add('gb-count-element');
        countElm.textContent = countString;
        treeNodeContent.appendChild(countElm);
      }
    } else {
      countElm = document.createElement('span');
      countElm.classList.add('gb-count-element');
      countElm.textContent = countString;
      treeNodeContent.appendChild(countElm);
    }
  }

  /**
   * Update the counts of given tree node elements
   * @param treeNodeElements - the visual html elements p-treenode
   * @param treeNodes - the underlying data objects
   */
  private updateTreeNodeCounts(treeNodeElements: any,
                       treeNodeData: TreeNode,
                       patientConstraint: Constraint) {
    let index = 0;
    for (let elm of treeNodeElements) {
      let dataObject: TreeNode = treeNodeData[index];
      let dataObjectType = dataObject['type'];
      let treeNodeContent = elm.querySelector('.ui-treenode-content');

      if (dataObjectType === 'STUDY') {
        /*
         * ------ If the tree node is a study node
         */
        const studyConstraint = this.generateConstraintFromConstraintObject(dataObject['constraint']);
        const studyId = dataObject['studyId'];
        let comboConstraint = new CombinationConstraint();
        comboConstraint.combinationState = CombinationState.And;
        comboConstraint.children.push(patientConstraint);
        comboConstraint.children.push(studyConstraint);
        this.resourceService.getCountsPerStudy(comboConstraint)
          .subscribe(
            (counts) => {
              let patientCount = counts[studyId] ? counts[studyId]['patientCount'] : 0;
              this.appendCountElement(treeNodeContent, patientCount);
            },
            err => console.error(err)
          );
      } else if (dataObjectType === 'NUMERIC' || dataObjectType === 'CATEGORICAL') {
        /*
         * ------ If the tree node is a concept node
         */
        const conceptConstraint = this.generateConstraintFromConstraintObject(dataObject['constraint']);
        const conceptCode = dataObject['conceptCode'];
        let comboConstraint = new CombinationConstraint();
        comboConstraint.combinationState = CombinationState.And;
        comboConstraint.children.push(patientConstraint);
        comboConstraint.children.push(conceptConstraint);
        this.resourceService.getCountsPerConcept(comboConstraint)
          .subscribe(
            (counts) => {
              let patientCount = counts[conceptCode] ? counts[conceptCode]['patientCount'] : 0;
              this.appendCountElement(treeNodeContent, patientCount);
            },
            err => console.error(err)
          );
      }
      // If the tree node is currently expanded
      if (dataObject['expanded']) {
        let treeNodeChildrenElms = elm.querySelector('.ui-treenode-children').children;
        let treeNodeChildren = dataObject.children;
        this.updateTreeNodeCounts(treeNodeChildrenElms, treeNodeChildren, patientConstraint);
      }
      index++;
    }
  }

  /**
   * Update the tree nodes' counts on the left panel
   */
  public updateExpandedTreeNodesCounts() {
    // let rootTreeNodeElements = this.element.nativeElement.querySelector('.ui-tree-container').children;
    let rootTreeNodeElements = document
      .getElementById('tree-nodes-component')
      .querySelector('.ui-tree-container').children;
    let rootTreeNodes = this.dimensionRegistryService.treeNodes;
    const rootInclusionConstraint = this.rootInclusionConstraint;
    const rootExclusionConstraint = this.rootExclusionConstraint;
    let patientConstraint = this.generateIntersectionConstraint(rootInclusionConstraint, rootExclusionConstraint);
    this.updateTreeNodeCounts(rootTreeNodeElements, rootTreeNodes, patientConstraint);
  }

  get patientCount(): number {
    return this._patientCount;
  }

  set patientCount(value: number) {
    this._patientCount = value;
  }

  get observationCount(): number {
    return this._observationCount;
  }

  set observationCount(value: number) {
    this._observationCount = value;
  }

  get conceptCount(): number {
    return this._conceptCount;
  }

  set conceptCount(value: number) {
    this._conceptCount = value;
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

  get alertMessages(): Array<object> {
    return this._alertMessages;
  }

  set alertMessages(value: Array<object>) {
    this._alertMessages = value;
  }
}
