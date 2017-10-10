import {Injectable} from '@angular/core';
import {CombinationConstraint} from '../models/constraints/combination-constraint';
import {ResourceService} from './resource.service';
import {Constraint} from '../models/constraints/constraint';
import {TrueConstraint} from '../models/constraints/true-constraint';
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
 * (2) saving / updating constraints as queries (that contain patient or observation constraints)
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

  /**
   * update the count of the selected patients
   */
  public updatePatientCounts() {
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
          if (this.loadingStateExclusion === 'complete') {
            this.patientCount = this.inclusionPatientCount - this.exclusionPatientCount;
            this.loadingStateTotal = 'complete';
          }
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
            if (this.loadingStateInclusion === 'complete') {
              this.patientCount = this.inclusionPatientCount - this.exclusionPatientCount;
              this.loadingStateTotal = 'complete';
            }
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

    /*
     * This is usually an expensive approach, when the final patients are not required,
     * the final patient count can be calculated by (inclusionCount - exclusionCount)
     */
    // let intersectionConstraint: Constraint =
    //   this.generateIntersectionConstraint(this.rootInclusionConstraint, this.rootExclusionConstraint);
    // this.resourceService.getPatients(intersectionConstraint, 'Intersection')
    //   .subscribe(
    //     patients => {
    //       this.patientCount = patients.length;
    //       this.loadingStateTotal = 'complete';
    //     },
    //     err => {
    //       console.error(err);
    //       this.loadingStateTotal = 'complete';
    //     }
    //   );


    /*
     * Also update patient counts on tree nodes
     */
    this.updateExpandedTreeNodesCounts(true);
    /*
     * Also update the observation count
     */
    this.updateObservationCounts();
  }

  /**
   * Update the count of observations on the selected patients
   */
  public updateObservationCounts() {
    const patientConstraint = this.getPatientConstraint();
    const observationConstraint = this.getObservationConstraint();
    this.resourceService.getPatientObservationCount(patientConstraint, observationConstraint)
      .subscribe(
        (count) => {
          this.observationCount = count;
        },
        err => console.error(err)
      );
  }

  /**
   * Get the constraint intersected on 'inclusion' and 'not exclusion' constraints
   * @returns {Constraint}
   */
  public getPatientConstraint(): Constraint {
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

      // If there is some constraint other than a true constraint in the inclusion
      // form a proper combination constraint to return
      if (!trueInclusion) {
        let combination = new CombinationConstraint();
        combination.combinationState = CombinationState.And;
        combination.children.push(inclusionConstraint);
        combination.children.push(negatedExclusionConstraint);
        return combination;
      } else {
        return negatedExclusionConstraint;
      }

    } else {
      // Otherwise just return the inclusion part
      return inclusionConstraint;
    }
  }

  /**
   * Get the constraint of selected concept variables in the observation-selection section
   * @returns {any}
   */
  public getObservationConstraint(): Constraint {
    const nodes = this.dimensionRegistryService.selectedTreeNodes;
    let constraint = null;
    if (nodes.length > 0) {
      let allLeaves = [];
      for (let node of nodes) {
        let leaves = [];
        this.dimensionRegistryService
          .getTreeNodeDescendantsWithExcludedTypes(node, ['UNKNOWN', 'STUDY'], leaves);
        allLeaves = allLeaves.concat(leaves);
      }
      this.conceptCount = allLeaves.length;
      constraint = new CombinationConstraint();
      constraint.combinationState = CombinationState.Or;
      for (let leaf of allLeaves) {
        const leafConstraint = this.generateConstraintFromConstraintObject(leaf['constraint']);
        if (leafConstraint) {
          constraint.children.push(leafConstraint);
        } else {
          console.error('Failed to create constrain from: ', leaf);
        }
      }
    } else {
      constraint = new TrueConstraint();
      this.conceptCount = this.dimensionRegistryService.concepts.length;
    }

    return constraint;
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
    }

    this.selectedNode = null;

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

  /**
   * Append a count element to the given treenode-content element
   * @param treeNodeContent
   * @param {number} count
   * @param {boolean} updated - true: add animation to indicate updated count
   */
  private appendCountElement(treeNodeContent, count: number, updated: boolean) {
    const countString = '(' + count + ')';
    let countElm = treeNodeContent.querySelector('.gb-count-element');
    if (!countElm) {
      countElm = document.createElement('span');
      countElm.classList.add('gb-count-element');
      if (updated) {
        countElm.classList.add('gb-count-element-updated');
      }
      countElm.textContent = countString;
      treeNodeContent.appendChild(countElm);
    } else {
      const oldCountString = countElm.textContent;
      if (countString !== oldCountString) {
        treeNodeContent.removeChild(countElm);
        countElm = document.createElement('span');
        countElm.classList.add('gb-count-element');
        if (updated) {
          countElm.classList.add('gb-count-element-updated');
        }
        countElm.textContent = countString;
        treeNodeContent.appendChild(countElm);
      }
    }
  }

  /**
   * Update the counts of the concept tree nodes of given tree node elements
   *
   * @param treeNodeElements - the visual html elements p-treenode
   * @param {TreeNode} treeNodeData - the underlying data objects
   * @param {Constraint} patientConstraint - the constraint that the user selects patients
   * @param {boolean} refresh -
   *                            true: always retrieve counts,
   *                            false: only retrieve counts if the patientCount field is missing
   */
  private updateConceptTreeNodeCounts(treeNodeElements: any,
                                      treeNodeData: TreeNode[],
                                      patientConstraint: Constraint,
                                      refresh: boolean) {
    let index = 0;
    for (let elm of treeNodeElements) {
      let dataObject: TreeNode = treeNodeData[index];
      let dataObjectType = dataObject['type'];
      if (dataObjectType === 'NUMERIC' || dataObjectType === 'CATEGORICAL') {
        let treeNodeContent = elm.querySelector('.ui-treenode-content');
        let go = (refresh) || ((!refresh) && !dataObject['patientCount']);
        if (go) {
          let identifier = dataObject['conceptCode'];
          const treeNodeConstraint = this.generateConstraintFromConstraintObject(dataObject['constraint']);
          let comboConstraint = new CombinationConstraint();
          comboConstraint.combinationState = CombinationState.And;
          comboConstraint.children.push(patientConstraint);
          comboConstraint.children.push(treeNodeConstraint);
          this.resourceService.getCountsPerConcept(comboConstraint)
            .subscribe(
              (counts) => {
                let patientCount = counts[identifier] ? counts[identifier]['patientCount'] : 0;
                dataObject['patientCount'] = patientCount;
                this.appendCountElement(treeNodeContent, patientCount, true);
              },
              err => console.error(err)
            );
        } else {
          this.appendCountElement(treeNodeContent, dataObject['patientCount'], false);
        }
      }
      // If the tree node is currently expanded
      if (dataObject['expanded']) {
        let treeNodeChildrenElms = elm.querySelector('.ui-treenode-children').children;
        let treeNodeChildren = dataObject.children;
        this.updateConceptTreeNodeCounts(treeNodeChildrenElms, treeNodeChildren, patientConstraint, refresh);
      }
      index++;
    }
  }

  /**
   * Update the counts of the study tree nodes of given tree node elements
   *
   * @param treeNodeElements - the visual html elements p-treenode
   * @param {TreeNode} treeNodeData - the underlying data objects
   * @param {Constraint} patientConstraint - the constraint that the user selects patients
   * @param {boolean} refresh -
   *                            true: always retrieve counts,
   *                            false: only retrieve counts if the patientCount field is missing
   */
  private updateStudyTreeNodeCounts(treeNodeElements: any,
                                    treeNodeData: TreeNode[],
                                    patientConstraint: Constraint,
                                    refresh: boolean,
                                    counts: any) {
    let index = 0;
    for (let elm of treeNodeElements) {
      let dataObject: TreeNode = treeNodeData[index];
      let dataObjectType = dataObject['type'];
      if (dataObjectType === 'STUDY') {
        let treeNodeContent = elm.querySelector('.ui-treenode-content');
        let go = (refresh) || ((!refresh) && !dataObject['patientCount']);
        if (go) {
          let identifier = dataObject['studyId'];
          let patientCount = counts[identifier] ? counts[identifier]['patientCount'] : 0;
          dataObject['patientCount'] = patientCount;
          this.appendCountElement(treeNodeContent, patientCount, true);
        } else {
          this.appendCountElement(treeNodeContent, dataObject['patientCount'], false);
        }
      }
      // If the tree node is currently expanded
      if (dataObject['expanded']) {
        const treeNodeChildrenElms = elm.querySelector('.ui-treenode-children').children;
        this.updateStudyTreeNodeCounts(treeNodeChildrenElms,
          dataObject.children,
          patientConstraint,
          refresh,
          counts);
      }
      index++;
    }
  }

  /**
   * Update the tree nodes' counts on the left panel
   */
  public updateExpandedTreeNodesCounts(refresh: boolean) {
    // let rootTreeNodeElements = this.element.nativeElement.querySelector('.ui-tree-container').children;
    let rootTreeNodeElements = document
      .getElementById('tree-nodes-component')
      .querySelector('.ui-tree-container').children;
    let rootTreeNodes = this.dimensionRegistryService.treeNodes;
    let patientConstraint = this.getPatientConstraint();
    /*
     * Get the patient count per study in one go,
     * then go into the tree nodes, find study nodes and assign the counts
     */
    this.resourceService.getCountsPerStudy(patientConstraint)
      .subscribe(
        (counts) => {
          this.updateStudyTreeNodeCounts(rootTreeNodeElements, rootTreeNodes, patientConstraint, refresh, counts);
        },
        err => console.error(err)
      );
    /*
     * Get the patient count per concept individually
     */
    this.updateConceptTreeNodeCounts(rootTreeNodeElements, rootTreeNodes, patientConstraint, refresh);
  }

  public saveQuery(queryName: string) {
    const patientConstraintObj = this.getPatientConstraint().toPatientQueryObject();
    const observationConstraintObj = this.getObservationConstraint().toQueryObject();
    const queryObj = {
      name: queryName,
      patientsQuery: patientConstraintObj,
      observationsQuery: observationConstraintObj,
      bookmarked: false
    };
    this.resourceService.saveQuery(queryObj)
      .subscribe(
        (newlySavedQuery) => {
          newlySavedQuery['collapsed'] = true;
          this.dimensionRegistryService.queries.push(newlySavedQuery);
          const summary = 'Query "' + queryName + '" is saved.';
          this.alertMessages.length = 0;
          this.alertMessages.push({severity: 'success', summary: summary, detail: ''});
        },
        (err) => {
          console.error(err);
          const summary = 'Could not save the query "' + queryName + '".';
          this.alertMessages.length = 0;
          this.alertMessages.push({severity: 'error', summary: summary, detail: ''});
        }
      );
  }

  public updateQuery(queryId: string, queryObject: object) {
    this.resourceService.updateQuery(queryId, queryObject)
      .subscribe(
        () => {
        },
        err => console.error(err)
      );
  }

  public deleteQuery(query) {
    this.resourceService.deleteQuery(query['id'])
      .subscribe(
        () => {
          const index = this.dimensionRegistryService.queries.indexOf(query);
          if (index > -1) {
            this.dimensionRegistryService.queries.splice(index, 1);
          }
          // An alternative would be to directly update the queries
          // using 'dimensionRegistryService.updateQueries()'
          // but this approach retrieves new query objects and
          // leaves the all queries to remain collapsed
        },
        err => console.error(err)
      );
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
