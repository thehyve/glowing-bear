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
import {Query} from '../models/query';
import {PatientSetConstraint} from '../models/constraints/patient-set-constraint';
import {PedigreeConstraint} from '../models/constraints/pedigree-constraint';
import {TimeConstraint} from '../models/constraints/time-constraint';
import {TrialVisitConstraint} from '../models/constraints/trial-visit-constraint';
import {TrialVisit} from '../models/trial-visit';
import {ValueConstraint} from '../models/constraints/value-constraint';

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
 *
 * General workflow of data selection:
 * select patients (rows), update the counts in the 1st step -->
 * select concepts (columns), update the counts in the 2nd step -->
 * update data table and charts (to be implemented) in 3rd/4th steps -->
 * update data formats available for export based on the previous data selection
 */
@Injectable()
export class ConstraintService {
  // The current query
  private _query: Query;
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
  /*
   * the map from concept codes to counts in the first step
   * (note that _conceptCountMap_1 is a super set of _conceptCountMap_2,
   * so there is no need to maintain _conceptCountMap_2)
   * e.g.
   * "EHR:DEM:AGE": {
   *  "observationCount": 3,
   *   "patientCount": 3
   *  },
   * "EHR:VSIGN:HR": {
   *  "observationCount": 9,
   *  "patientCount": 3
   * }
   */
  private _conceptCountMap_1 = {};
  /*
   * the map from study codes to counts in the first step
   * (note that _studyCountMap_1 is a super set of _studyCountMap_2,
   * so there is no need to maintain _studyCountMap_2)
   * e.g.
   * "MIX_HD": {
   *   "observationCount": 12,
   *   "patientCount": 3
   * }
   */
  private _studyCountMap_1 = {};
  loadingStateInclusion: LoadingState = 'complete';
  loadingStateExclusion: LoadingState = 'complete';
  loadingStateTotal: LoadingState = 'complete';
  // the queue that holds the time stamps of the calls made in the 1st step
  private _queueOfCalls_1 = [];

  /*
   * ------ variables used in the 2nd step (Projection) accordion in Data Selection ------
   */
  // the number of patients further refined in the second step
  // _patientCount_2 < or = _patientCount_1
  private _patientCount_2 = 0;
  private _isLoadingPatientCount_2 = true; // the flag indicating if the count is being loaded
  // the number of observations further refined in the second step
  // _observationCount_2 could be <, > or = _observationCount_1
  private _observationCount_2 = 0;
  private _isLoadingObservationCount_2 = true; // the flag indicating if the count is being loaded
  // the number of concepts further refined in the second step
  // _conceptCount_2 could be <, > or = _conceptCount_1
  private _conceptCount_2 = 0;
  private _isLoadingConceptCount_2 = true; // the flag indicating if the count is being loaded
  // the number of studies further refined in the second step
  // _studyCount_2 could be <, > or = _studyCount_1
  private _studyCount_2 = 0;
  private _isLoadingStudyCount_2 = true; // the flag indicating if the count is being loaded
  // the codes of the concepts selected in the second step
  private _conceptCodes_2 = [];
  // the codes of the studies selected in the first step
  private _studyCodes_2 = [];
  // the queue that holds the time stamps of the calls made in the 2nd step
  private _queueOfCalls_2 = [];

  /*
   * ------ other variables ------
   */
  private _exportFormats: object[] = [];
  private _isLoadingExportFormats = true;
  /*
   * The alert messages (for PrimeNg message UI) that informs the user
   * whether there is an error saving patient/observation set,
   * or the saving has been successful
   */
  private _alertMessages = [];

  /*
   * The selected node (drag-start) in the side-panel of either
   * (1) the tree
   * (2) the patient sets
   * or (3) the observation sets
   */
  private _selectedNode: any = null;


  constructor(private resourceService: ResourceService,
              private treeNodeService: TreeNodeService) {
    this.rootInclusionConstraint = new CombinationConstraint();
    this.rootInclusionConstraint.isRoot = true;
    this.rootExclusionConstraint = new CombinationConstraint();
    this.rootExclusionConstraint.isRoot = true;
  }

  /**
   * update the patient, observation, concept and study counts in the first step
   */
  public updateCounts_1(continueUpdate?: boolean) {
    // add time stamp to the queue,
    // only when the time stamp is at the end of the queue, the count is updated
    this.clearQueueOfCalls(this.queueOfCalls_1);
    let timestamp = new Date();
    this.queueOfCalls_1.push(timestamp.getMilliseconds());
    // set the flags
    this.loadingStateInclusion = 'loading';
    this.loadingStateExclusion = 'loading';
    this.loadingStateTotal = 'loading';
    // also update the flags for the counts in the 2nd step
    this.isLoadingPatientCount_2 = true;
    this.isLoadingObservationCount_2 = true;
    this.isLoadingConceptCount_2 = true;
    this.isLoadingStudyCount_2 = true;
    /*
     * Inclusion constraint patient count
     */
    let inclusionConstraint = this.generateInclusionConstraint(this.rootInclusionConstraint);
    this.resourceService.getCounts(inclusionConstraint)
      .subscribe(
        countResponse => {
          const index = this.queueOfCalls_1.indexOf(timestamp.getMilliseconds());
          if (index !== -1 && index === (this.queueOfCalls_1.length - 1)) {
            this.inclusionPatientCount = countResponse['patientCount'];
            this.loadingStateInclusion = 'complete';
            if (this.loadingStateTotal !== 'complete' && this.loadingStateExclusion === 'complete') {
              this.patientCount_1 = this.inclusionPatientCount - this.exclusionPatientCount;
              this.loadingStateTotal = 'complete';
              this.observationCount_1 = countResponse['observationCount'];
              // Update the final counts: patients and observations
              this.patientCount_2 = this.patientCount_1;
              this.observationCount_2 = this.observationCount_1;
              this.isLoadingPatientCount_2 = false;
              this.isLoadingObservationCount_2 = false;
            }
          }
        },
        err => {
          console.error(err);
          this.loadingStateInclusion = 'complete';
        }
      );

    /*
     * Exclusion constraint patient count
     * (Only execute the exclusion constraint if it has non-empty children)
     */
    if ((<CombinationConstraint>this.rootExclusionConstraint).hasNonEmptyChildren()) {
      let exclusionConstraint =
        this.generateExclusionConstraint(this.rootInclusionConstraint, this.rootExclusionConstraint);
      this.resourceService.getCounts(exclusionConstraint)
        .subscribe(
          countResponse => {
            const index = this.queueOfCalls_1.indexOf(timestamp.getMilliseconds());
            if (index !== -1 && index === (this.queueOfCalls_1.length - 1)) {
              this.exclusionPatientCount = countResponse['patientCount'];
              this.loadingStateExclusion = 'complete';
              if (this.loadingStateTotal !== 'complete' && this.loadingStateInclusion === 'complete') {
                this.patientCount_1 = this.inclusionPatientCount - this.exclusionPatientCount;
                this.loadingStateTotal = 'complete';
                this.observationCount_1 = countResponse['observationCount'];
                // Update the final counts: patients and observations
                this.patientCount_2 = this.patientCount_1;
                this.observationCount_2 = this.observationCount_1;
                this.isLoadingPatientCount_2 = false;
                this.isLoadingObservationCount_2 = false;
              }
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
     * update concept and study counts in the first step
     */
    const selectionConstraint = this.getSelectionConstraint();
    this.resourceService.getCountsPerStudyAndConcept(selectionConstraint)
      .subscribe(
        (countObj) => {
          const index = this.queueOfCalls_1.indexOf(timestamp.getMilliseconds());
          if (index !== -1 && index === (this.queueOfCalls_1.length - 1)) {
            let studyKeys = [];
            let conceptKeys = [];
            this.conceptCountMap_1 = {};
            this.studyCountMap_1 = {};
            for (let studyKey in countObj) {
              studyKeys.push(studyKey);
              let _concepts_ = countObj[studyKey];
              let patientCountUnderThisStudy = 0;
              let observationCountUnderThisStudy = 0;
              for (let _concept_ in _concepts_) {
                if (conceptKeys.indexOf(_concept_) === -1) {
                  conceptKeys.push(_concept_);
                }
                this.conceptCountMap_1[_concept_] = countObj[studyKey][_concept_];
                patientCountUnderThisStudy += this.conceptCountMap_1[_concept_]['patientCount'];
                observationCountUnderThisStudy += this.conceptCountMap_1[_concept_]['observationCount'];
              }
              this.studyCountMap_1[studyKey] = {
                patientCount: patientCountUnderThisStudy,
                observationCount: observationCountUnderThisStudy
              };
            }
            this.conceptCount_1 = conceptKeys.length;
            this.studyCount_1 = studyKeys.length;
            this.conceptCodes_1 = conceptKeys;
            // Update the final counts: concepts and studies
            this.conceptCount_2 = this.conceptCount_1;
            this.studyCount_2 = this.studyCount_1;
            this.conceptCodes_2 = this.conceptCodes_1;
            this.isLoadingConceptCount_2 = false;
            this.isLoadingStudyCount_2 = false;
            /*
             * update patient counts on tree nodes on the left side
             */
            this.updateTreeNodeCounts();
            /*
             * update the export info
             */
            this.updateExports();
            /*
             * update the tree nodes in the 2nd step
             */
            this.updateTreeNodes_2(continueUpdate);
          }
        },
        err => console.error(err)
      );
  }

  /**
   * This function handles the asynchronicity
   * between updating the 2nd-step counts and the loading of tree nodes:
   * only when the tree nodes are completely loaded can we start updating
   * the counts in the 2nd step
   */
  private updateTreeNodes_2(continueUpdate: boolean) {
    if (this.treeNodeService.isTreeNodeLoadingComplete()) {
      let checklist = this.query ? this.query.observationsQuery['data'] : null;
      if (checklist) {
        let parentPaths = [];
        for (let path of checklist) {
          let _parentPaths = this.treeNodeService.getParentTreeNodePaths(path);
          for (let _parentPath of _parentPaths) {
            if (!parentPaths.includes(_parentPath)) {
              parentPaths.push(_parentPath);
            }
          }
        }
        checklist = checklist.concat(parentPaths);
      }
      this.treeNodeService.updateProjectionTreeData(this.conceptCountMap_1, checklist);
      this.query = null;
      if (continueUpdate) {
        this.updateCounts_2();
      }
    } else {
      window.setTimeout((function () {
        this.updateTreeNodes_2();
      }).bind(this), 500);
    }
  }

  /**
   * update the patient, observation, concept and study counts in the second step
   */
  public updateCounts_2() {
    // add time stamp to the queue,
    // only when the time stamp is at the end of the queue, the count is updated
    this.clearQueueOfCalls(this.queueOfCalls_2);
    let timestamp = new Date();
    this.queueOfCalls_2.push(timestamp.getMilliseconds());
    // set flags to true indicating the counts are being loaded
    this.isLoadingPatientCount_2 = true;
    this.isLoadingObservationCount_2 = true;
    this.isLoadingConceptCount_2 = true;
    this.isLoadingStudyCount_2 = true;

    this.query = null; // clear query
    const selectionConstraint = this.getSelectionConstraint();
    const projectionConstraint = this.getProjectionConstraint();

    let combo = new CombinationConstraint();
    combo.addChild(selectionConstraint);
    combo.addChild(projectionConstraint);

    // update the patient count and observation count in the 2nd step
    this.resourceService.getCounts(combo)
      .subscribe(
        (countResponse) => {
          const index = this.queueOfCalls_2.indexOf(timestamp.getMilliseconds());
          if (index !== -1 && index === (this.queueOfCalls_2.length - 1)) {
            this.patientCount_2 = countResponse['patientCount'];
            this.isLoadingPatientCount_2 = false;
            this.observationCount_2 = countResponse['observationCount'];
            this.isLoadingObservationCount_2 = false;
          }
        },
        err => console.error(err)
      );

    // update the concept and study counts in the 2nd step
    this.resourceService.getCountsPerStudyAndConcept(combo)
      .subscribe(
        (countObj) => {
          const index = this.queueOfCalls_2.indexOf(timestamp.getMilliseconds());
          if (index !== -1 && index === (this.queueOfCalls_2.length - 1)) {
            let studies = [];
            let concepts = [];
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
            this.isLoadingConceptCount_2 = false;
            this.isLoadingStudyCount_2 = false;
          }
        },
        err => console.error(err)
      );
    this.updateExports();
  }

  public updateExports() {
    const selectionConstraint = this.getSelectionConstraint();
    const projectionConstraint = this.getProjectionConstraint();
    let combo = new CombinationConstraint();
    combo.addChild(selectionConstraint);
    combo.addChild(projectionConstraint);
    // update the export info
    this.isLoadingExportFormats = true;
    this.resourceService.getExportDataFormats(combo)
      .subscribe(
        (dataFormatNames) => {
          let fileFormatNames = ['TSV', 'SPSS'];
          this.exportFormats = [];
          for (let dataFormatName of dataFormatNames) {
            let format = {
              name: dataFormatName,
              checked: true,
              fileFormats: []
            };
            for (let fileFormatName of fileFormatNames) {
              format.fileFormats.push({
                name: fileFormatName,
                checked: true
              });
            }
            this.exportFormats.push(format);
          }
          this.isLoadingExportFormats = false;
        },
        err => console.error(err)
      );
  }

  /**
   * Clear the elements before the last element
   * @param {Array<number>} queue
   */
  private clearQueueOfCalls(queue: Array<number>) {
    if (queue && queue.length > 1) {
      const lastElement = queue[queue.length - 1];
      queue.length = 0;
      queue.push(lastElement);
    }
  }

  /**
   * Get the constraint intersected on 'inclusion' and 'not exclusion' constraints
   * @returns {Constraint}
   */
  public getSelectionConstraint(): Constraint {
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
    resultConstraint.isPatientSelection = true;
    return resultConstraint;
  }

  /**
   * Clear the patient constraints
   */
  public clearSelectionConstraint() {
    this.rootInclusionConstraint.children.length = 0;
    this.rootExclusionConstraint.children.length = 0;
  }

  /**
   * Get the constraint of selected concept variables in the observation-selection section
   * @returns {any}
   */
  public getProjectionConstraint(): Constraint {
    let nodes = this.treeNodeService.getTopTreeNodes(this.treeNodeService.selectedProjectionTreeData);
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


  private putSelectionConstraint(constraint: Constraint) {
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
        this.putSelectionConstraint(remainingConstraint);
      } else {
        for (let child of children) {
          this.rootInclusionConstraint.addChild(child);
        }
      }
    } else if (constraint.getClassName() === 'NegationConstraint') {
      this.rootExclusionConstraint.addChild((<NegationConstraint>constraint).constraint);
    } else if (constraint.getClassName() !== 'TrueConstraint') {
      this.rootInclusionConstraint.addChild(constraint);
    }
  }

  public alert(summary: string, detail: string, severity: string) {
    this.alertMessages.length = 0;
    this.alertMessages.push({severity: severity, summary: summary, detail: detail});
  }

  /**
   * Generate the constraint for retrieving the patients with only the inclusion criteria
   * @param inclusionConstraint
   * @returns {TrueConstraint|Constraint}
   */
  generateInclusionConstraint(inclusionConstraint: Constraint): Constraint {
    return (<CombinationConstraint>inclusionConstraint).hasNonEmptyChildren() ?
      inclusionConstraint : new TrueConstraint();
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
    combination.addChild(inclusionConstraint);
    combination.addChild(exclusionConstraint);
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
        treeNodeType === 'CATEGORICAL' ||
        treeNodeType === 'DATE') {
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
            let dConstraint = this.generateConstraintFromSelectedNode(descendant, DropMode.TreeNode);
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

    this.selectedNode = null;

    return constraint;
  }

  generateConstraintFromConstraintObject(constraintObjectInput: object): Constraint {
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
      constraint = new PatientSetConstraint();
      if (constraintObject['subjectIds']) {
        (<PatientSetConstraint>constraint).subjectIds = constraintObject['subjectIds'];
      } else if (constraintObject['patientIds']) {
        (<PatientSetConstraint>constraint).patientIds = constraintObject['patientIds'];
      } else if (constraintObject['patientSetId']) {
        (<PatientSetConstraint>constraint).patientSetId = constraintObject['patientSetId'];
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

  optimizeConstraintObject(constraintObject) {
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
   * Update the counts of the study tree nodes of given tree node elements
   *
   * @param treeNodeElements - the visual html elements p-treenode
   * @param {TreeNode} treeNodeData - the underlying data objects
   * @param {Constraint} patientConstraint - the constraint that the user selects patients
   * @param {boolean} refresh -
   *                            true: always retrieve counts,
   *                            false: only retrieve counts if the patientCount field is missing
   */
  private updateTreeNodeCountsIterative(treeNodeElements: any,
                                        treeNodeData: TreeNode[],
                                        studyCountMap: object,
                                        conceptCountMap: object) {
    let index = 0;
    for (let elm of treeNodeElements) {
      let dataObject: TreeNode = treeNodeData[index];
      if (this.treeNodeService.isTreeNodeAstudy(dataObject) ||
        this.treeNodeService.isTreeNodeAconcept(dataObject)) {
        let treeNodeContent = elm.querySelector('.ui-treenode-content');
        const identifier =
          this.treeNodeService.isTreeNodeAstudy(dataObject) ? dataObject['studyId'] : dataObject['conceptCode'];
        const map =
          this.treeNodeService.isTreeNodeAstudy(dataObject) ? studyCountMap : conceptCountMap;
        const patientCount =
          map[identifier] ? map[identifier]['patientCount'] : 0;
        const updated =
          (dataObject['patientCount'] && dataObject['patientCount'] !== patientCount) || !dataObject['patientCount'];
        dataObject['patientCount'] = patientCount;
        this.appendCountElement(treeNodeContent, patientCount, updated);
      }
      // If the tree node is currently expanded
      if (dataObject['expanded']) {
        let uiTreenodeChildren = elm.querySelector('.ui-treenode-children');
        if (uiTreenodeChildren) {
          this.updateTreeNodeCountsIterative(
            uiTreenodeChildren.children,
            dataObject.children,
            studyCountMap,
            conceptCountMap);
        }
      }
      index++;
    }
  }

  /**
   * Update the tree nodes' counts on the left panel
   */
  public updateTreeNodeCounts() {
    let rootTreeNodeElements = document
      .getElementById('tree-nodes-component')
      .querySelector('.ui-tree-container').children;
    this.updateTreeNodeCountsIterative(
      rootTreeNodeElements,
      this.treeNodeService.treeNodes,
      this.studyCountMap_1,
      this.conceptCountMap_1);
  }

  public saveQuery(queryName: string) {
    const patientConstraintObj = this.getSelectionConstraint().toQueryObject();
    let data = [];
    for (let item of this.treeNodeService.selectedProjectionTreeData) {
      data.push(item['fullName']);
    }
    const observationConstraintObj = {
      data: data
    };
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
          newlySavedQuery['visible'] = true;
          this.treeNodeService.queries.push(newlySavedQuery);
          const summary = 'Query "' + queryName + '" is saved.';
          this.alert(summary, '', 'success');
        },
        (err) => {
          console.error(err);
          const summary = 'Could not save the query "' + queryName + '".';
          this.alert(summary, '', 'error');
        }
      );
  }

  public putQuery(query: Query) {
    this.query = query;
    this.clearSelectionConstraint();
    let selectionConstraint = this.generateConstraintFromConstraintObject(query['patientsQuery']);
    this.putSelectionConstraint(selectionConstraint);
    this.updateCounts_1(true);
    const summary = 'Query "' + query['name'] + '" imported';
    this.alert(summary, '', 'info');
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

  public depthOfConstraint(constraint: Constraint): number {
    let depth = 0;
    if (constraint.parent !== null) {
      depth++;
      depth += this.depthOfConstraint(constraint.parent);
    }
    return depth;
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

  get studyCountMap_1(): {} {
    return this._studyCountMap_1;
  }

  set studyCountMap_1(value: {}) {
    this._studyCountMap_1 = value;
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

  get alertMessages(): Array<object> {
    return this._alertMessages;
  }

  set alertMessages(value: Array<object>) {
    this._alertMessages = value;
  }

  get query(): Query {
    return this._query;
  }

  set query(value: Query) {
    this._query = value;
  }

  get isLoadingPatientCount_2(): boolean {
    return this._isLoadingPatientCount_2;
  }

  set isLoadingPatientCount_2(value: boolean) {
    this._isLoadingPatientCount_2 = value;
  }

  get isLoadingObservationCount_2(): boolean {
    return this._isLoadingObservationCount_2;
  }

  set isLoadingObservationCount_2(value: boolean) {
    this._isLoadingObservationCount_2 = value;
  }

  get isLoadingConceptCount_2(): boolean {
    return this._isLoadingConceptCount_2;
  }

  set isLoadingConceptCount_2(value: boolean) {
    this._isLoadingConceptCount_2 = value;
  }

  get isLoadingStudyCount_2(): boolean {
    return this._isLoadingStudyCount_2;
  }

  set isLoadingStudyCount_2(value: boolean) {
    this._isLoadingStudyCount_2 = value;
  }

  get queueOfCalls_1(): Array<number> {
    return this._queueOfCalls_1;
  }

  set queueOfCalls_1(value: Array<number>) {
    this._queueOfCalls_1 = value;
  }

  get queueOfCalls_2(): Array<number> {
    return this._queueOfCalls_2;
  }

  set queueOfCalls_2(value: Array<number>) {
    this._queueOfCalls_2 = value;
  }

  get exportFormats(): object[] {
    return this._exportFormats;
  }

  set exportFormats(value: object[]) {
    this._exportFormats = value;
  }

  get isLoadingExportFormats(): boolean {
    return this._isLoadingExportFormats;
  }

  set isLoadingExportFormats(value: boolean) {
    this._isLoadingExportFormats = value;
  }
}
