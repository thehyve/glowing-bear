import {Injectable} from '@angular/core';
import {CombinationConstraint} from '../models/constraints/combination-constraint';
import {ResourceService} from './resource.service';
import {TreeNodeService} from './tree-node.service';
import {Query} from '../models/query';
import {ConstraintService} from './constraint.service';
import {AppConfig} from '../config/app.config';
import {Step} from '../models/step';
import {Constraint} from '../models/constraints/constraint';
import {PatientSetConstraint} from '../models/constraints/patient-set-constraint';

type LoadingState = 'loading' | 'complete';

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
  /*
   * when step 1 constraints are changed, whether to call updateCounts_1 immediately,
   * used in gb-constraint-component
   */
  private _instantCountsUpdate_1: boolean;
  // flag indicating if the counts in the first step are being updated
  private _isUpdating_1 = false;
  // flag indicating if the query in the 1st step has been changed
  private _isDirty_1 = false;
  // the number of subjects selected in the first step
  private _subjectCount_1 = 0;
  // the number of observations from the selected subjects in the first step
  private _observationCount_1 = 0;
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
  private _patientSet_1: PatientSetConstraint = null;

  /*
   * ------ variables used in the 2nd step (Projection) accordion in Data Selection ------
   */
  /*
   * when step 2 constraints are changed, whether to call updateCounts_2 immediately,
   * used in gb-projection-component
   */
  private _instantCountsUpdate_2: boolean;
  // flag indicating if the counts in the first step are being updated
  private _isUpdating_2 = false;
  // flag indicating if the query in the 2nd step has been changed
  private _isDirty_2 = false;
  // the number of subjects further refined in the second step
  // _subjectCount_2 < or = _subjectCount_1
  private _subjectCount_2 = 0;
  private _isLoadingSubjectCount_2 = true; // the flag indicating if the count is being loaded
  // the number of observations further refined in the second step
  // _observationCount_2 could be <, > or = _observationCount_1
  private _observationCount_2 = 0;
  private _isLoadingObservationCount_2 = true; // the flag indicating if the count is being loaded
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
   * Flag indicating if to relay the counts in the current step to the next
   */
  private _countsRelay: boolean;


  constructor(private appConfig: AppConfig,
              private resourceService: ResourceService,
              private treeNodeService: TreeNodeService,
              private constraintService: ConstraintService) {
    this.instantCountsUpdate_1 = appConfig.getConfig('step-1-instant-counts-update');
    this.instantCountsUpdate_2 = appConfig.getConfig('step-2-instant-counts-update');
    this.countsRelay = appConfig.getConfig('counts-relay');
    this.loadQueries();
  }

  private handle_error(err) {
    console.error(err);
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
        err => this.handle_error(err)
      );
  }

  /**
   * ------------------------------------------------- BEGIN: step 1 -------------------------------------------------
   */
  private updateInclusionCounts(timeStamp: Date, initialUpdate: boolean) {
    let inclusionConstraint = this.constraintService.generateInclusionConstraint();
    this.resourceService.getCounts(inclusionConstraint)
      .subscribe(
        countResponse => {
          const index = this.queueOfCalls_1.indexOf(timeStamp.getMilliseconds());
          if (index !== -1 && index === (this.queueOfCalls_1.length - 1)) {
            this.inclusionSubjectCount = countResponse['patientCount'];
            this.loadingStateInclusion = 'complete';
            if (this.loadingStateTotal !== 'complete' && this.loadingStateExclusion === 'complete') {
              this.subjectCount_1 = this.inclusionSubjectCount - this.exclusionSubjectCount;
              this.loadingStateTotal = 'complete';
              this.observationCount_1 = countResponse['observationCount'];
              if (initialUpdate) {
                this.subjectCount_0 = this.subjectCount_1;
                this.observationCount_0 = this.observationCount_1;
              }
              // relay the current counts to the next step: subjects and observations
              if (this.countsRelay) {
                this.subjectCount_2 = this.subjectCount_1;
                this.observationCount_2 = this.observationCount_1;
                this.isLoadingSubjectCount_2 = false;
                this.isLoadingObservationCount_2 = false;
              }
            }
          }
        },
        err => {
          this.handle_error(err);
          this.loadingStateInclusion = 'complete';
        }
      );
  }
  private updateExclusionCounts(timeStamp: Date, initialUpdate: boolean) {
    if (this.constraintService.rootExclusionConstraint.hasNonEmptyChildren()) {
      let exclusionConstraint = this.constraintService.generateExclusionConstraint();
      this.resourceService.getCounts(exclusionConstraint)
        .subscribe(
          countResponse => {
            const index = this.queueOfCalls_1.indexOf(timeStamp.getMilliseconds());
            if (index !== -1 && index === (this.queueOfCalls_1.length - 1)) {
              this.exclusionSubjectCount = countResponse['patientCount'];
              this.loadingStateExclusion = 'complete';
              if (this.loadingStateTotal !== 'complete' && this.loadingStateInclusion === 'complete') {
                this.subjectCount_1 = this.inclusionSubjectCount - this.exclusionSubjectCount;
                this.loadingStateTotal = 'complete';
                this.observationCount_1 = countResponse['observationCount'];
                if (initialUpdate) {
                  this.subjectCount_0 = this.subjectCount_1;
                  this.observationCount_0 = this.observationCount_1;
                }
                // relay the current counts to the next step: subjects and observations
                if (this.countsRelay) {
                  this.subjectCount_2 = this.subjectCount_1;
                  this.observationCount_2 = this.observationCount_1;
                  this.isLoadingSubjectCount_2 = false;
                  this.isLoadingObservationCount_2 = false;
                }
              }
            }
          },
          err => {
            this.handle_error(err);
            this.loadingStateExclusion = 'complete';
          }
        );
    } else {
      this.exclusionSubjectCount = 0;
      this.loadingStateExclusion = 'complete';
    }
  }
  private updateConceptsAndStudies(timeStamp: Date) {
    const selectionConstraint = this.constraintService.generateSelectionConstraint();
    this.resourceService.getCountsPerStudyAndConcept(selectionConstraint)
      .subscribe(
        (countObj) => {
          const index = this.queueOfCalls_1.indexOf(timeStamp.getMilliseconds());
          if (index !== -1 && index === (this.queueOfCalls_1.length - 1)) {
            this.conceptCountMap_1 = {};
            this.studyCountMap_1 = {};
            for (let studyKey in countObj) {
              let _concepts_ = countObj[studyKey];
              let patientCountUnderThisStudy = 0;
              let observationCountUnderThisStudy = 0;
              for (let _concept_ in _concepts_) {
                this.conceptCountMap_1[_concept_] = countObj[studyKey][_concept_];
                patientCountUnderThisStudy += this.conceptCountMap_1[_concept_]['patientCount'];
                observationCountUnderThisStudy += this.conceptCountMap_1[_concept_]['observationCount'];
              }
              this.studyCountMap_1[studyKey] = {
                patientCount: patientCountUnderThisStudy,
                observationCount: observationCountUnderThisStudy
              };
            }
            /*
             * update subject counts on tree nodes on the left side
             */
            this.treeNodeService.updateTreeNodeCounts(this.studyCountMap_1, this.conceptCountMap_1);
            /*
             * update the tree nodes in the 2nd step
             */
            this.prepareStep2();
          }
        },
        err => this.handle_error(err)
      );
  }
  /**
   * update the subject, observation, concept and study counts in the first step
   */
  public updateCounts_1(initialUpdate?: boolean) {
    this.isUpdating_1 = true;
    this.patientSet_1 = null;
    /*
     * ====== function updateCounts_1 starts ======
     */
    // add time stamp to the queue,
    // only when the time stamp is at the end of the queue, the count is updated
    this.clearQueueOfCalls(this.queueOfCalls_1);
    let timeStamp = new Date();
    this.queueOfCalls_1.push(timeStamp.getMilliseconds());
    // set the flags
    this.loadingStateInclusion = 'loading';
    this.loadingStateExclusion = 'loading';
    this.loadingStateTotal = 'loading';
    // also update the flags for the counts in the 2nd step
    this.isLoadingSubjectCount_2 = true;
    this.isLoadingObservationCount_2 = true;
    /*
     * Inclusion constraint subject count
     */
    this.updateInclusionCounts(timeStamp, initialUpdate);
    /*
     * Exclusion constraint subject count
     * (Only execute the exclusion constraint if it has non-empty children)
     */
    this.updateExclusionCounts(timeStamp, initialUpdate);
    /*
     * update concept and study counts in the first step
     */
    this.updateConceptsAndStudies(timeStamp);
    /*
     * create patient set for the current query in step 1
     */
    // this.updatePatientSet(timeStamp);
    /*
     * ====== function updateCounts_1 ends ======
     */
  }

  // private updatePatientSet(timeStamp) {
  //   const selectionConstraint = this.constraintService.generateSelectionConstraint();
  //   this.resourceService.createPatientSet(name, selectionConstraint)
  //     .subscribe(
  //       patientSetObj => {
  //         this.patientSet_1 = new PatientSetConstraint();
  //         this.patientSet_1.setSize = patientSetObj['setSize'];
  //         this.patientSet_1.id = patientSetObj['id'];
  //         this.patientSet_1.status = patientSetObj['status'];
  //         /*
  //         * update concept and study counts in the first step
  //         */
  //         this.resourceService.getCountsPerStudyAndConcept(this.patientSet_1)
  //           .subscribe(
  //             (countObj) => {
  //               this.updateConceptsAndStudies(timeStamp);
  //             },
  //             err => this.handle_error(err)
  //           );
  //       },
  //       err => this.handle_error(err)
  //     );
  // }

  /**
   * This function handles the asynchronicity
   * between updating the 2nd-step counts and the loading of tree nodes:
   * only when the tree nodes are completely loaded can we start updating
   * the counts in the 2nd step
   */
  private prepareStep2() {
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
      this.isDirty_1 = false;
    } else {
      window.setTimeout((function () {
        this.prepareStep2();
      }).bind(this), 500);
    }
  }
  /**
   * ------------------------------------------------- END: step 1 ---------------------------------------------------
   */

  /**
   * ------------------------------------------------- BEGIN: step 2 -------------------------------------------------
   */
  /**
   * update the subject, observation, concept and study counts in the second step
   */
  public updateCounts_2() {
    /*
     * ====== function updateCounts_2 starts ======
     */
    if (!this.isUpdating_1) {
      this.isUpdating_2 = true;
      // add time stamp to the queue,
      // only when the time stamp is at the end of the queue, the count is updated
      this.clearQueueOfCalls(this.queueOfCalls_2);
      let timeStamp = new Date();
      this.queueOfCalls_2.push(timeStamp.getMilliseconds());
      // set flags to true indicating the counts are being loaded
      this.isLoadingSubjectCount_2 = true;
      this.isLoadingObservationCount_2 = true;

      this.query = null; // clear query
      const selectionConstraint = this.patientSet_1 ?
        this.patientSet_1 : this.constraintService.generateSelectionConstraint();
      const projectionConstraint = this.constraintService.generateProjectionConstraint();

      let combo = new CombinationConstraint();
      combo.addChild(selectionConstraint);
      combo.addChild(projectionConstraint);

      // update the subject count and observation count in the 2nd step
      this.resourceService.getCounts(combo)
        .subscribe(
          (countResponse) => {
            const index = this.queueOfCalls_2.indexOf(timeStamp.getMilliseconds());
            if (index !== -1 && index === (this.queueOfCalls_2.length - 1)) {
              this.subjectCount_2 = countResponse['patientCount'];
              this.isLoadingSubjectCount_2 = false;
              this.observationCount_2 = countResponse['observationCount'];
              this.isLoadingObservationCount_2 = false;
              this.isUpdating_2 = false;
              this.isDirty_2 = false;
            }
          },
          err => this.handle_error(err)
        );
      this.updateExports();
    } else {
      window.setTimeout((function () {
        this.updateCounts_2();
      }).bind(this), 500);
    }
    /*
     * ====== function updateCounts_2 ends ======
     */
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
        err => this.handle_error(err)
      );
  }

  /**
   * ------------------------------------------------- END: step 2 --------------------------------------------------
   */

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
    const patientConstraintObj = this.constraintService.generateSelectionConstraint().toQueryObject(true);
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
        err => this.handle_error(err)
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
        err => this.handle_error(err)
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

  get isLoadingSubjectCount_2(): boolean {
    return this._isLoadingSubjectCount_2;
  }

  set isLoadingSubjectCount_2(value: boolean) {
    this._isLoadingSubjectCount_2 = value;
  }

  get isLoadingObservationCount_2(): boolean {
    return this._isLoadingObservationCount_2;
  }

  set isLoadingObservationCount_2(value: boolean) {
    this._isLoadingObservationCount_2 = value;
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

  get instantCountsUpdate_1(): boolean {
    return this._instantCountsUpdate_1;
  }

  set instantCountsUpdate_1(value: boolean) {
    this._instantCountsUpdate_1 = value;
  }

  get instantCountsUpdate_2(): boolean {
    return this._instantCountsUpdate_2;
  }

  set instantCountsUpdate_2(value: boolean) {
    this._instantCountsUpdate_2 = value;
  }

  get countsRelay(): boolean {
    return this._countsRelay;
  }

  set countsRelay(value: boolean) {
    this._countsRelay = value;
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

  get isDirty_1(): boolean {
    return this._isDirty_1;
  }

  set isDirty_1(value: boolean) {
    this._isDirty_1 = value;
  }

  get isDirty_2(): boolean {
    return this._isDirty_2;
  }

  set isDirty_2(value: boolean) {
    this._isDirty_2 = value;
  }

  get patientSet_1(): PatientSetConstraint {
    return this._patientSet_1;
  }

  set patientSet_1(value: PatientSetConstraint) {
    this._patientSet_1 = value;
  }
}
