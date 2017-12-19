import {Injectable} from '@angular/core';
import {CombinationConstraint} from '../models/constraints/combination-constraint';
import {ResourceService} from './resource.service';
import {TreeNodeService} from './tree-node.service';
import {Query} from '../models/query';
import {ConstraintService} from './constraint.service';
import {AppConfig} from '../config/app.config';
import {Step} from '../models/step';
import { Constraint } from '../models/constraints/constraint';

export type LoadingState = 'loading' | 'complete';

/**
 * This service concerns with
 * (1) Updating subject and observation counts in the steps in data-selection
 * (2) Saving / Updating / Restoring / Deleting queries in the queries panel on the left
 *
 * Remark: the subject set, observation set, concept set and study set used
 * in the 2nd step (i.e. the projection step) are subsets of the corresponding sets
 * in the 1st step (i.e. the selection step).
 * Hence, each time the 1st sets updated, so should be the 2nd sets.
 * However, each time the 2nd sets updated, the 1st sets remain unaffected.
 *
 * General workflow of data selection:
 * select subjects (rows), update the counts in the 1st step -->
 * select concepts (columns), update the counts in the 2nd step -->
 * update data table and charts (to be implemented) in 3rd/4th steps -->
 * update data formats available for export based on the previous data selection
 */
@Injectable()
export class QueryService {
  // The current step at which the user is composing query
  private _step: Step = Step.I;
  // The currently selected query
  private _query: Query;
  // The list of queries of the user
  private _queries: Query[] = [];
  /*
   * ------ variables used in the 0th step, i.e. the total numbers of things ------
   */
  private _subjectCount_0 = 0;
  private _observationCount_0 = 0;
  /*
   * ------ variables used in the 1st step (Selection) accordion in Data Selection ------
   */
  private _inclusionSubjectCount = 0;
  private _exclusionSubjectCount = 0;
  // flag indicating if the counts in the first step are being updated
  private _isUpdating_1 = true;
  private _inclusionObservationCount = 0;
  private _exclusionObservationCount = 0;
  // the number of subjects selected in the first step
  private _subjectCount_1 = 0;
  // the number of observations from the selected subjects in the first step
  private _observationCount_1 = 0;
  // the number of concepts from the selected subjects in the first step
  private _conceptCount_1 = 0;
  // the number of studies from the selected subjects in the first step
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
  // flag indicating if the counts in the second step are being updated
  private _isUpdating_2 = false;
  // the number of subjects further refined in the second step
  // _subjectCount_2 < or = _subjectCount_1
  private _subjectCount_2 = 0;
  // the number of observations further refined in the second step
  // _observationCount_2 could be <, > or = _observationCount_1
  private _observationCount_2 = 0;
  // the number of concepts further refined in the second step
  // _conceptCount_2 could be <, > or = _conceptCount_1
  private _conceptCount_2 = 0;
  // the number of studies further refined in the second step
  // _studyCount_2 could be <, > or = _studyCount_1
  private _studyCount_2 = 0;
  private _isLoadingTreeCounts_2 = false; // the flag indicating if the count is being loaded
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
   * whether there is an error saving subject/observation set,
   * or the saving has been successful
   */
  private _alertMessages = [];
  /*
   * when step 1 constraints are changed, whether to call updateCounts_1 immediately,
   * used in gb-constraint-component
   */
  private _instantCountUpdate_1: boolean;
  /*
   * when step 2 constraints are changed, whether to call updateCounts_2 immediately,
   * used in gb-projection-component
   */
  private _instantCountUpdate_2: boolean;
  /*
   * during the updateCounts_1 call, whether to update the final counts immediately,
   * used inside this.updateCounts_1()
   */
  private _syncFinalCounts: boolean;

  /**
   * Flag if the current visible counts are out of sync with the current subject query.
   */
  private _dirty_1 = false;
  /**
   * Flag if the current visible counts are out of sync with the current projection query.
   */
  private _dirty_2 = false;

  constructor(private appConfig: AppConfig,
              private resourceService: ResourceService,
              private treeNodeService: TreeNodeService,
              private constraintService: ConstraintService) {
    this.instantCountUpdate_1 = appConfig.getConfig('step-1-instant-counts-update');
    this.instantCountUpdate_2 = appConfig.getConfig('step-2-instant-counts-update');
    this.syncFinalCounts = appConfig.getConfig('final-counts-sync');
    this.loadQueries();
  }

  /**
   * Update the queries on the left-side panel
   */
  public loadQueries() {
    this.resourceService.getQueries()
      .subscribe(
        (queries) => {
          this.queries.length = 0;
          let bookmarkedQueries = [];
          queries.forEach(query => {
            query['collapsed'] = true;
            query['visible'] = true;
            if (query['bookmarked']) {
              bookmarkedQueries.push(query);
            } else {
              this.queries.push(query);
            }
          });
          this.queries = bookmarkedQueries.concat(this.queries);
        },
        err => console.error(err)
      );
  }

  public mergeInclusionAndExclusionCounts(initialUpdate?: boolean) {
      this.subjectCount_1 = this.inclusionSubjectCount - this.exclusionSubjectCount;
      this.observationCount_1 = this.inclusionObservationCount - this.exclusionObservationCount;
      if (initialUpdate) {
          this.subjectCount_0 = this.subjectCount_1;
          this.observationCount_0 = this.observationCount_1;
      }
      this.isUpdating_1 = false;
      this.loadingStateTotal = 'complete';
  }

  public updateInclusionCounts(constraint: Constraint, initialUpdate?: boolean) {
    /*
     * Inclusion constraint subject count
     */
    this.resourceService.getCounts(constraint)
      .subscribe(
          countResponse => {
        this.inclusionSubjectCount = countResponse['patientCount'];
        this.inclusionObservationCount = countResponse['observationCount'];
        this.loadingStateInclusion = 'complete';
        if (this.loadingStateTotal !== 'complete' && this.loadingStateExclusion === 'complete') {
          this.mergeInclusionAndExclusionCounts(initialUpdate);
        }
      },
      err => {
          console.error(err);
          this.loadingStateInclusion = 'complete';
          this.loadingStateTotal = 'complete';
      }
    );
  }

  public updateExclusionCounts(constraint: Constraint, initialUpdate?: boolean) {
    /*
     * Exclusion constraint subject count
     * (Only execute the exclusion constraint if it has non-empty children)
     */
    this.resourceService.getCounts(constraint)
        .subscribe(
            countResponse => {
          this.exclusionSubjectCount = countResponse['patientCount'];
          this.exclusionObservationCount = countResponse['observationCount'];
          this.loadingStateExclusion = 'complete';
          if (this.loadingStateTotal !== 'complete' && this.loadingStateInclusion === 'complete') {
            this.mergeInclusionAndExclusionCounts(initialUpdate);
          }
        },
        err => {
            console.error(err);
            this.loadingStateExclusion = 'complete';
            this.loadingStateTotal = 'complete';
        }
      );
  }

  /**
   * update the patient, observation, concept and study counts in the first step
   */
  public updateCounts_1(initialUpdate?: boolean) {
    this.loadingStateTotal = 'loading';
    this.isUpdating_1 = true;
    this.dirty_1 = false;
    /*
     * ====== function updateCounts_1 starts ======
     */
    this.loadingStateInclusion = 'loading';
    let hasExclusionConstraints = this.constraintService.rootExclusionConstraint.hasNonEmptyChildren();
    if (hasExclusionConstraints) {
      this.loadingStateExclusion = 'loading';
      let exclusionConstraint = this.constraintService.generateExclusionConstraint();
      this.updateExclusionCounts(exclusionConstraint, initialUpdate);
    } else {
      this.exclusionSubjectCount = 0;
      this.exclusionObservationCount = 0;
    }
    let inclusionConstraint = this.constraintService.generateInclusionConstraint();
    this.updateInclusionCounts(inclusionConstraint, initialUpdate);
    /*
     * ====== function updateCounts_1 ends ======
     */
  }

  /**
   * This function handles the asynchronicity
   * between updating the 2nd-step counts and the loading of tree nodes:
   * only when the tree nodes are completely loaded can we start updating
   * the counts in the 2nd step
   */
  private updateTreeNodes_2() {
    if (this.treeNodeService.isTreeNodeLoadingComplete()) {

      // Only update the tree in the 2nd step when the user changes sth. in the 1st step
      if (this.step !== Step.II) {
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
        } else if (this.treeNodeService.selectedProjectionTreeData.length > 0) {
          checklist = [];
          for (let selectedNode of this.treeNodeService.selectedProjectionTreeData) {
            checklist.push(selectedNode['fullName']);
          }
        }
        this.treeNodeService.updateProjectionTreeData(this.conceptCountMap_1, checklist);
      }

      this.query = null;
      this.isUpdating_1 = false;
    } else {
      window.setTimeout((function () {
        this.updateTreeNodes_2();
      }).bind(this), 500);
    }
  }

  public updatePatientsAndObservationsCounts(constraint: Constraint) {
    // set flags to true indicating the counts are being loaded
    this.isUpdating_2 = true;
    // update the patient count and observation count in the 2nd step
    this.resourceService.getCounts(constraint)
      .subscribe(
          (countResponse) => {
          this.subjectCount_2 = countResponse['patientCount'];
          this.observationCount_2 = countResponse['observationCount'];
          this.isUpdating_2 = false;
        },
        err => console.error(err)
    );
  }

  public updateStudyAndConceptCounts(constraint: Constraint) {
    // set flags to true indicating the counts are being loaded
    this.isLoadingTreeCounts_2 = true;
    // update the concept and study counts in the 2nd step
    this.resourceService.getCountsPerStudyAndConcept(constraint)
      .subscribe(
          (countObj) => {
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

        this.conceptCount_2 = this.conceptCount_1;
        this.studyCount_2 = this.studyCount_1;
        this.conceptCodes_2 = this.conceptCodes_1;
        this.isLoadingTreeCounts_2 = false;
        this.updateTreeNodes_2();
      },
      err => console.error(err)
    );
  }

  /**
   * update the concept and study counts as preparation for the second step
   */
  public prepareStep2() {
    /*
     * ====== function updateCounts_2 starts ======
     */
    this.query = null; // clear query
    const selectionConstraint = this.constraintService.generateSelectionConstraint();
    // this.updatePatientsAndObservationsCounts(selectionConstraint);
    this.updateStudyAndConceptCounts(selectionConstraint);
    /*
     * ====== function updateCounts_2 ends ======
     */
  }

  /**
   * Update subject and observations counts in step 2 (variable selection).
   */
  public updateCounts_2() {
      this.dirty_2 = false;
      this.query = null; // clear query
      const selectionConstraint = this.constraintService.generateSelectionConstraint();
      const projectionConstraint = this.constraintService.generateProjectionConstraint();
      let constraint = new CombinationConstraint();
      constraint.addChild(selectionConstraint);
      constraint.addChild(projectionConstraint);
      this.updatePatientsAndObservationsCounts(constraint);
  }

  public updateExports() {
    const selectionConstraint = this.constraintService.generateSelectionConstraint();
    const projectionConstraint = this.constraintService.generateProjectionConstraint();
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

  public alert(summary: string, detail: string, severity: string) {
    this.alertMessages.length = 0;
    this.alertMessages.push({severity: severity, summary: summary, detail: detail});
  }

  public saveQuery(queryName: string) {
    const patientConstraintObj = this.constraintService.generateSelectionConstraint().toQueryObject();
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
          this.queries.push(newlySavedQuery);
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

  public restoreQuery(query: Query) {
    this.query = query;
    this.constraintService.clearSelectionConstraint();
    let selectionConstraint = this.constraintService.generateConstraintFromConstraintObject(query['patientsQuery']);
    this.constraintService.restoreSelectionConstraint(selectionConstraint);
    this.updateCounts_1();
    this.updateCounts_2();
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
          const index = this.queries.indexOf(query);
          if (index > -1) {
            this.queries.splice(index, 1);
          }
          // An alternative would be to directly update the queries
          // using 'treeNodeService.updateQueries()'
          // but this approach retrieves new query objects and
          // leaves the all queries to remain collapsed
        },
        err => console.error(err)
      );
  }

  get inclusionSubjectCount(): number {
    return this._inclusionSubjectCount;
  }

  set inclusionSubjectCount(value: number) {
    this._inclusionSubjectCount = value;
  }

  get exclusionSubjectCount(): number {
    return this._exclusionSubjectCount;
  }

  set exclusionSubjectCount(value: number) {
    this._exclusionSubjectCount = value;
  }

  get subjectCount_0(): number {
    return this._subjectCount_0;
  }

  set subjectCount_0(value: number) {
    this._subjectCount_0 = value;
  }

  get observationCount_0(): number {
    return this._observationCount_0;
  }

  set observationCount_0(value: number) {
    this._observationCount_0 = value;
  }

  get inclusionObservationCount(): number {
    return this._inclusionObservationCount;
  }

  set inclusionObservationCount(value: number) {
    this._inclusionObservationCount = value;
  }

  get exclusionObservationCount(): number {
    return this._exclusionObservationCount;
  }

  set exclusionObservationCount(value: number) {
    this._exclusionObservationCount = value;
  }

  get subjectCount_1(): number {
    return this._subjectCount_1;
  }

  set subjectCount_1(value: number) {
    this._subjectCount_1 = value;
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

  get subjectCount_2(): number {
    return this._subjectCount_2;
  }

  set subjectCount_2(value: number) {
    this._subjectCount_2 = value;
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

  get isLoadingTreeCounts_2(): boolean {
    return this._isLoadingTreeCounts_2;
  }

  set isLoadingTreeCounts_2(value: boolean) {
    this._isLoadingTreeCounts_2 = value;
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

  get queries(): Query[] {
    return this._queries;
  }

  set queries(value: Query[]) {
    this._queries = value;
  }

  get instantCountUpdate_1(): boolean {
    return this._instantCountUpdate_1;
  }

  set instantCountUpdate_1(value: boolean) {
    this._instantCountUpdate_1 = value;
  }

  get instantCountUpdate_2(): boolean {
    return this._instantCountUpdate_2;
  }

  set instantCountUpdate_2(value: boolean) {
    this._instantCountUpdate_2 = value;
  }

  get syncFinalCounts(): boolean {
    return this._syncFinalCounts;
  }

  set syncFinalCounts(value: boolean) {
    this._syncFinalCounts = value;
  }

  get step(): Step {
    return this._step;
  }

  set step(value: Step) {
    this._step = value;
  }

  get isUpdating_1(): boolean {
    return this._isUpdating_1;
  }

  set isUpdating_1(value: boolean) {
    this._isUpdating_1 = value;
  }

  get isUpdating_2(): boolean {
    return this._isUpdating_2;
  }

  set isUpdating_2(value: boolean) {
    this._isUpdating_2 = value;
  }

  get dirty_1(): boolean {
    return this._dirty_1;
  }

  set dirty_1(value: boolean) {
    this._dirty_1 = value;
  }

  get dirty_2(): boolean {
    return this._dirty_2;
  }

  set dirty_2(value: boolean) {
    this._dirty_2 = value;
  }

}
