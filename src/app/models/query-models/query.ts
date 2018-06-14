import {QuerySubscriptionFrequency} from './query-subscription-frequency';
import {QueryDiffRecord} from './query-diff-record';
import {DataTable} from '../table-models/data-table';
import {Constraint} from '../constraint-models/constraint';
import {TransmartConstraintMapper} from '../../utilities/transmart-utilities/transmart-constraint-mapper';

export class Query {

  private _id: string;
  private _name: string;
  private _description: string;
  private _createDate: string;
  // The information about the creation date, e.g. 3 days ago
  private _createDateInfo: string;
  private _updateDate: string;
  // The information about the update date, e.g. 3 days ago
  private _updateDateInfo: string;
  private _apiVersion: string;
  // Indicate if the set is bookmarked
  private _bookmarked: boolean;
  // Indicate if the set is collapsed
  private _collapsed: boolean;
  // Indicate if the set is selected, in other words, being edited
  private _selected: boolean;
  // The visual indicator flags the visibility of the query
  private _visible: boolean;
  // 1st step: the subject constraint part of the query
  private _subjectQuery: Constraint;
  // 2nd step: the observation constraint part of the query
  private _observationQuery: { data: string[] };
  // 3rd step: the definition of data table
  private _dataTable: DataTable;

  /*
   * Subscription feature
   */
  // Indicate if the set is subscribed
  private _subscribed: boolean;
  // Indicate if the subscription panel is collapsed
  // note that this panel only appears if the query is subscribed
  private _subscriptionCollapsed: boolean;
  // The frequency of the subscription: daily or monthly
  private _subscriptionFreq: QuerySubscriptionFrequency;
  // The number of patients that this query covers
  private _numSubjects: number;
  // The historical records showing the differences between results of this query
  private _diffRecords: QueryDiffRecord[];


  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.collapsed = false;
    this.bookmarked = false;
    this.selected = false;
    this.subscriptionFreq = QuerySubscriptionFrequency.WEEKLY;
    this.diffRecords = [];
  }

  toPlainObject(): object {
    let obj = {};
    obj['id'] = this.id;
    obj['name'] = this.name;
    obj['bookmarked'] = this.bookmarked;
    obj['subscribed'] = this.subscribed;
    if (this.subscriptionFreq) {
      obj['subscriptionFreq'] = this.subscriptionFreq;
    }
    if (this.description) {
      obj['description'] = this.description;
    }
    if (this.createDate) {
      obj['createDate'] = this.createDate;
    }
    if (this.updateDate) {
      obj['updateDate'] = this.updateDate;
    }
    if (this.subjectQuery) {
      obj['patientsQuery'] = TransmartConstraintMapper.mapConstraint(this.subjectQuery, true);
    }
    if (this.observationQuery) {
      obj['observationsQuery'] = this.observationQuery;
    }
    // TODO: create toPlainObject() function for dataTable
    // if (this.dataTable) {
    //   obj['dataTable'] = this.dataTable;
    // }

    return obj;
  }

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  get bookmarked(): boolean {
    return this._bookmarked;
  }

  set bookmarked(value: boolean) {
    this._bookmarked = value;
  }

  get subscribed(): boolean {
    return this._subscribed;
  }

  set subscribed(value: boolean) {
    this._subscribed = value;
  }

  get collapsed(): boolean {
    return this._collapsed;
  }

  set collapsed(value: boolean) {
    this._collapsed = value;
  }

  get selected(): boolean {
    return this._selected;
  }

  set selected(value: boolean) {
    this._selected = value;
  }

  get subjectQuery(): Constraint {
    return this._subjectQuery;
  }

  set subjectQuery(value: Constraint) {
    this._subjectQuery = value;
  }

  get observationQuery(): { data: string[] } {
    return this._observationQuery;
  }

  set observationQuery(value: { data: string[] }) {
    this._observationQuery = value;
  }

  get dataTable(): DataTable {
    return this._dataTable;
  }

  set dataTable(value: DataTable) {
    this._dataTable = value;
  }

  get createDate(): string {
    return this._createDate;
  }

  set createDate(value: string) {
    this._createDate = value;
  }

  get updateDate(): string {
    return this._updateDate;
  }

  set updateDate(value: string) {
    this._updateDate = value;
  }

  get apiVersion(): string {
    return this._apiVersion;
  }

  set apiVersion(value: string) {
    this._apiVersion = value;
  }

  get visible(): boolean {
    return this._visible;
  }

  set visible(value: boolean) {
    this._visible = value;
  }

  get createDateInfo(): string {
    return this._createDateInfo;
  }

  set createDateInfo(value: string) {
    this._createDateInfo = value;
  }

  get updateDateInfo(): string {
    return this._updateDateInfo;
  }

  set updateDateInfo(value: string) {
    this._updateDateInfo = value;
  }

  get subscriptionCollapsed(): boolean {
    return this._subscriptionCollapsed;
  }

  set subscriptionCollapsed(value: boolean) {
    this._subscriptionCollapsed = value;
  }

  get subscriptionFreq(): QuerySubscriptionFrequency {
    return this._subscriptionFreq;
  }

  set subscriptionFreq(value: QuerySubscriptionFrequency) {
    this._subscriptionFreq = value;
  }

  get numSubjects(): number {
    return this._numSubjects;
  }

  set numSubjects(value: number) {
    this._numSubjects = value;
  }

  get diffRecords(): QueryDiffRecord[] {
    return this._diffRecords;
  }

  set diffRecords(value: QueryDiffRecord[]) {
    this._diffRecords = value;
  }
}
