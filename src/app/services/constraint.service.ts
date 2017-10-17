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
import {TreeNodeService} from './tree-node.service';
import {TreeNode} from 'primeng/primeng';

type LoadingState = 'loading' | 'complete';

/**
 * This service concerns with
 * (1) translating string or JSON objects into Constraint class instances
 * (2) saving / updating constraints as queries (that contain patient or observation constraints)
 * (3) updating relevant patient or observation counts
 * Remark: the patient set, observation set, concept set and study set used
 * in the 2nd step (i.e. the projection step) are subsets of the corresponding sets
 * in the 1st step (i.e. the selection step).
 * Hence, each time the 1st sets updated, so should be the 2nd sets.
 * However, each time the 2nd sets updated, the 1st sets remain unaffected.
 */
@Injectable()
export class ConstraintService {

  /*
   * ------ variables used in the 1st step (Selection) accordion in Data Selection ------
   */
  private _inclusionPatientCount = 0;
  private _exclusionPatientCount = 0;
  private _rootInclusionConstraint: CombinationConstraint;
  private _rootExclusionConstraint: CombinationConstraint;
  // the number of patients selected in the first step
  private _patientCount_1 = 0;
  // the number of observations from the selected patients in the first step
  private _observationCount_1 = 0;
  // the number of concepts from the selected patients in the first step
  private _conceptCount_1 = 0;
  // the number of studies from the selected patients in the first step
  private _studyCount_1 = 0;
  // the codes of the concepts selected in the first step
  private _conceptCodes_1 = [];
  // the codes of the studies selected in the first step
  private _studyCodes_1 = [];
  // the map from concept codes to counts in the first step
  // e.g.
  /*
   "EHR:DEM:AGE": {
      "observationCount": 3,
      "patientCount": 3
   },
   "EHR:VSIGN:HR": {
      "observationCount": 9,
      "patientCount": 3
   }
   */
  private _conceptCountMap_1 = {};

  /*
   * ------ variables used in the 2nd step (Projection) accordion in Data Selection ------
   */
  // the number of patients further refined in the second step
  // _patientCount_2 < or = _patientCount_1
  private _patientCount_2 = 0;
  // the number of observations further refined in the second step
  // _observationCount_2 could be <, > or = _observationCount_1
  private _observationCount_2 = 0;
  // the number of concepts further refined in the second step
  // _conceptCount_2 could be <, > or = _conceptCount_1
  private _conceptCount_2 = 0;
  // the number of studies further refined in the second step
  // _studyCount_2 could be <, > or = _studyCount_1
  private _studyCount_2 = 0;
  // the codes of the concepts selected in the second step
  private _conceptCodes_2 = [];
  // the codes of the studies selected in the first step
  private _studyCodes_2 = [];

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
              private treeNodeService: TreeNodeService) {
    this._rootInclusionConstraint = new CombinationConstraint();
    this._rootExclusionConstraint = new CombinationConstraint();
    this._validTreeNodeTypes = [
      'NUMERIC',
      'CATEGORICAL',
      'DATE',
      'STUDY',
      'TEXT',
      'UNKNOWN'
    ];
  }

  /**
   * update the patient, observation, concept and study counts in the first step
   */
  public updateCounts_1() {
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
          if (this.loadingStateTotal !== 'complete' && this.loadingStateExclusion === 'complete') {
            this.patientCount_1 = this.inclusionPatientCount - this.exclusionPatientCount;
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
            if (this.loadingStateTotal !== 'complete' && this.loadingStateInclusion === 'complete') {
              this.patientCount_1 = this.inclusionPatientCount - this.exclusionPatientCount;
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

    const selectionConstraint = this.getSelectionConstraint();
    /*
     * update observation count in the first step
     */
    this.resourceService.getObservationCount(selectionConstraint)
      .subscribe(
        (count) => {
          this.observationCount_1 = count;
        },
        err => console.error(err)
      );
    /*
     * update concept and study counts in the first step
     */
    this.resourceService.getCountsPerStudyAndConcept(selectionConstraint)
      .subscribe(
        (countObj) => {
          let studies = [];
          let concepts = [];
          for (let study in countObj) {
            studies.push(study);
            let _concepts_ = countObj[study];
            for (let _concept_ in _concepts_) {
              if (concepts.indexOf(_concept_) === -1) {
                concepts.push(_concept_);
              }
              this.conceptCountMap_1[_concept_] = countObj[study][_concept_];
            }
          }
          this.conceptCount_1 = concepts.length;
          this.studyCount_1 = studies.length;
          this.conceptCodes_1 = concepts;

          // update the tree table in the 2nd step
          this.treeNodeService.updateTreeTableData(this.conceptCodes_1, this.conceptCountMap_1);
          this.updateCounts_2();
        },
        err => console.error(err)
      );

    /*
     * Also update patient counts on tree nodes on the left side
     */
    this.updateExpandedTreeNodesCounts(true);

  }

  /**
   * update the patient, observation, concept and study counts in the second step
   */
  public updateCounts_2() {
    const selectionConstraint = this.getSelectionConstraint();
    const projectionConstraint = this.getProjectionConstraint();

    let combo = new CombinationConstraint();
    combo.children.push(selectionConstraint);
    combo.children.push(projectionConstraint);

    // update the patient count in the 2nd step
    this.resourceService.getPatients(combo, null)
      .subscribe(
        (patients) => {
          this.patientCount_2 = patients.length;
        },
        err => console.error(err)
      );

    // update the observation count in the 2nd step
    this.resourceService.getPatientObservationCount(selectionConstraint, projectionConstraint)
      .subscribe(
        (count) => {
          this.observationCount_2 = count;
        },
        err => console.error(err)
      );

    // update the concept and study counts in the 2nd step
    this.resourceService.getCountsPerStudyAndConcept(combo)
      .subscribe(
        (countObj) => {
          let studies = [];
          let concepts = [];
          this.conceptCountMap_1 = {};
          for (let study in countObj) {
            studies.push(study);
            let _concepts_ = countObj[study];
            for (let _concept_ in _concepts_) {
              if (concepts.indexOf(_concept_) === -1) {
                concepts.push(_concept_);
              }
            }
          }
          this.conceptCount_2 = concepts.length;
          this.studyCount_2 = studies.length;
          this.conceptCodes_2 = concepts;
        },
        err => console.error(err)
      );
  }

  /**
   * Get the constraint intersected on 'inclusion' and 'not exclusion' constraints
   * @returns {Constraint}
   */
  public getSelectionConstraint(): Constraint {
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
   * Clear the patient constraints
   */
  public clearSelectionConstraint() {
    this.rootInclusionConstraint.children.length = 0;
    this.rootExclusionConstraint.children.length = 0;
  }

  /**
   * Replace the current patient constraints:
   * rootInclusionConstraint and rootExclusionConstraint
   * with the given constraint
   * @param {Constraint} constraint
   */
  public putPatientConstraint(constraint: Constraint) {
    if (constraint.getClassName() === 'CombinationConstraint') { // If it is a combination constraint
      const children = (<CombinationConstraint>constraint).children;
      let hasNegation = children.length === 2
        && (children[1].getClassName() === 'NegationConstraint' || children[0].getClassName() === 'NegationConstraint');
      if (hasNegation) {
        let negationConstraint =
          <NegationConstraint>(children[1].getClassName() === 'NegationConstraint' ? children[1] : children[0]);
        this.rootExclusionConstraint.children.push(negationConstraint.constraint);
        let remainingConstraint =
          <NegationConstraint>(children[0].getClassName() === 'NegationConstraint' ? children[1] : children[0]);
        this.putPatientConstraint(remainingConstraint);
      } else {
        for (let child of children) {
          this.putPatientConstraint(child);
        }
      }
    } else { // If it is not a combination constraint
      if (constraint.getClassName() !== 'TrueConstraint') {
        this.rootInclusionConstraint.children.push(constraint);
      }
    }
    this.updateCounts_1();
  }

  /**
   * Get the constraint of selected concept variables in the observation-selection section
   * @returns {any}
   */
  public getProjectionConstraint(): Constraint {
    const nodes = this.treeNodeService.selectedTreeTableData;
    let constraint = null;
    if (nodes.length > 0) {
      let allLeaves = [];
      for (let node of nodes) {
        if (node['children']) {
          let leaves = [];
          this.treeNodeService
            .getTreeNodeDescendantsWithExcludedTypes(node, ['UNKNOWN', 'STUDY'], leaves);
          allLeaves = allLeaves.concat(leaves);
        } else {
          allLeaves.push(node);
        }
      }
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
      constraint = new NegationConstraint(new TrueConstraint());
    }

    return constraint;
  }


  /**
   * Replace the current observation constraint with the given constraint
   * @param {Constraint} constraint
   */
  public putObservationConstraint(constraint: Constraint) {
    // The observation constraint must be a combination of selected concepts
    // (sometimes with conditional study constraints)
    if (constraint.getClassName() === 'CombinationConstraint') {
      let paths = [];
      this.extractConceptPaths(constraint, paths);
      let nodes = this.treeNodeService.treeNodes;
      let foundTreeNodes = [];
      this.treeNodeService.findTreeNodesByPaths(nodes, paths, foundTreeNodes);
      this.treeNodeService.updateSelectedTreeNodesPrime(foundTreeNodes);
      this.updateCounts_2();
    }
  }

  private extractConceptPaths(constraint: Constraint, paths: string[]) {
    if (constraint.getClassName() === 'CombinationConstraint') {
      const children = (<CombinationConstraint>constraint).children;
      for (let child of children) {
        this.extractConceptPaths(child, paths);
      }
    } else if (constraint.getClassName() === 'ConceptConstraint') {
      paths.push((<ConceptConstraint>constraint).concept.path);
    }
  }

  public clearObservationConstraint() {
    this.treeNodeService.selectedTreeNodes.length = 0;
    this.treeNodeService.selectedTreeNodesPrime.length = 0;
    this.treeNodeService.selectAllTreeNodes(false);
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
        this.treeNodeService
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

  generateConstraintFromConstraintObject(constraintObjectInput): Constraint {
    let constraintObject = this.optimizeConstraintObject(constraintObjectInput);
    let type = constraintObject['type'];
    let constraint: Constraint = null;
    if (type === 'concept') { // ------> If it is a concept constraint
      let concept = new Concept();
      concept.path = constraintObject['path'];
      concept.type = constraintObject['valueType'];
      constraint = new ConceptConstraint();
      (<ConceptConstraint>constraint).concept = concept;
    } else if (type === 'study_name') { // ------> If it is a study constraint
      let study = new Study();
      study.studyId = constraintObject['studyId'];
      constraint = new StudyConstraint();
      (<StudyConstraint>constraint).studies.push(study);
    } else if (type === 'combination') { // ------> If it is a combination constraint
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
    } else if (type === 'and' || type === 'or') { // ------> If it is a combination constraint of a different form
      let operator = type;
      constraint = new CombinationConstraint();
      (<CombinationConstraint>constraint).combinationState =
        (operator === 'and') ? CombinationState.And : CombinationState.Or;
      for (let arg of constraintObject['args']) {
        let child = this.generateConstraintFromConstraintObject(arg);
        (<CombinationConstraint>constraint).children.push(child);
      }
    } else if (type === 'true') { // ------> If it is a true constraint
      constraint = new TrueConstraint();
    } else if (type === 'negation') { // ------> If it is a negation constraint
      const childConstraint = this.generateConstraintFromConstraintObject(constraintObject['arg']);
      constraint = new NegationConstraint(childConstraint);
    } else if (type === 'subselection'
      && constraintObject['dimension'] === 'patient') { // ------> If it is a patient sub-selection
      constraint = this.generateConstraintFromConstraintObject(constraintObject['constraint']);
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
        const uiTreenodeChildren = elm.querySelector('.ui-treenode-children');
        if (uiTreenodeChildren) {
          this.updateConceptTreeNodeCounts(uiTreenodeChildren.children,
            dataObject.children,
            patientConstraint,
            refresh);
        }
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
        let uiTreenodeChildren = elm.querySelector('.ui-treenode-children');
        if (uiTreenodeChildren) {
          this.updateStudyTreeNodeCounts(uiTreenodeChildren.children,
            dataObject.children,
            patientConstraint,
            refresh,
            counts);
        }
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
    let rootTreeNodes = this.treeNodeService.treeNodes;
    let patientConstraint = this.getSelectionConstraint();
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
    const patientConstraintObj = this.getSelectionConstraint().toPatientQueryObject();
    const observationConstraintObj = this.getProjectionConstraint().toQueryObject();
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
          this.treeNodeService.queries.push(newlySavedQuery);
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
          const index = this.treeNodeService.queries.indexOf(query);
          if (index > -1) {
            this.treeNodeService.queries.splice(index, 1);
          }
          // An alternative would be to directly update the queries
          // using 'treeNodeService.updateQueries()'
          // but this approach retrieves new query objects and
          // leaves the all queries to remain collapsed
        },
        err => console.error(err)
      );
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

  get patientCount_1(): number {
    return this._patientCount_1;
  }

  set patientCount_1(value: number) {
    this._patientCount_1 = value;
  }

  get observationCount_1(): number {
    return this._observationCount_1;
  }

  set observationCount_1(value: number) {
    this._observationCount_1 = value;
  }

  get conceptCount_1(): number {
    return this._conceptCount_1;
  }

  set conceptCount_1(value: number) {
    this._conceptCount_1 = value;
  }

  get studyCount_1(): number {
    return this._studyCount_1;
  }

  set studyCount_1(value: number) {
    this._studyCount_1 = value;
  }

  get conceptCodes_1(): Array<any> {
    return this._conceptCodes_1;
  }

  set conceptCodes_1(value: Array<any>) {
    this._conceptCodes_1 = value;
  }

  get studyCodes_1(): Array<any> {
    return this._studyCodes_1;
  }

  set studyCodes_1(value: Array<any>) {
    this._studyCodes_1 = value;
  }

  get conceptCountMap_1(): {} {
    return this._conceptCountMap_1;
  }

  set conceptCountMap_1(value: {}) {
    this._conceptCountMap_1 = value;
  }

  get observationCount_2(): number {
    return this._observationCount_2;
  }

  set observationCount_2(value: number) {
    this._observationCount_2 = value;
  }

  get studyCount_2(): number {
    return this._studyCount_2;
  }

  set studyCount_2(value: number) {
    this._studyCount_2 = value;
  }

  get patientCount_2(): number {
    return this._patientCount_2;
  }

  set patientCount_2(value: number) {
    this._patientCount_2 = value;
  }

  get conceptCount_2(): number {
    return this._conceptCount_2;
  }

  set conceptCount_2(value: number) {
    this._conceptCount_2 = value;
  }

  get studyCodes_2(): Array<any> {
    return this._studyCodes_2;
  }

  set studyCodes_2(value: Array<any>) {
    this._studyCodes_2 = value;
  }

  get conceptCodes_2(): Array<any> {
    return this._conceptCodes_2;
  }

  set conceptCodes_2(value: Array<any>) {
    this._conceptCodes_2 = value;
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
