/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {CohortSubscriptionFrequency} from './cohort-subscription-frequency';
import {CohortDiffRecord} from './cohort-diff-record';
import {Constraint} from '../constraint-models/constraint';
import {FormatHelper} from '../../utilities/format-helper';
import {CombinationConstraint} from '../constraint-models/combination-constraint';

export class Cohort {
  private _id: string;
  private _name: string;
  // Type of the cohort equals dimension selected on the constraint root level
  private _type: string;
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
  // Indicate if the set is selected
  private _selected: boolean;
  // The visual indicator flags the visibility of the cohort
  private _visible: boolean;
  // Indicate if the controls for this cohort are enabled
  private _controlsEnabled: boolean;
  // The constraint that defines the cohort
  private _constraint: Constraint;

  /*
   * Subscription feature
   */
  // Indicate if the set is subscribed
  private _subscribed: boolean;
  // Indicate if the subscription panel is collapsed
  // note that this panel only appears if the query is subscribed
  private _subscriptionCollapsed: boolean;
  // The frequency of the subscription: daily or monthly
  private _subscriptionFreq: CohortSubscriptionFrequency;
  // The number of patients that this query covers
  private _numSubjects: number;
  // The historical records showing the differences between results of this query
  private _diffRecords: CohortDiffRecord[];


  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.type = CombinationConstraint.TOP_LEVEL_DIMENSION;
    this.collapsed = true;
    this.visible = true;
    this.bookmarked = false;
    this.selected = false;
    this.controlsEnabled = true;
    this.subscriptionFreq = CohortSubscriptionFrequency.WEEKLY;
    this.subscriptionCollapsed = true;
    this.diffRecords = [];
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

  get type(): string {
    return this._type;
  }

  set type(value: string) {
    this._type = value;
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
    if (value && !this.subscriptionFreq) {
      this.subscriptionFreq = CohortSubscriptionFrequency.WEEKLY;
    }
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

  get createDate(): string {
    return this._createDate;
  }

  set createDate(value: string) {
    this._createDate = value;
    this.createDateInfo = FormatHelper.formatDateSemantics(new Date(value));
  }

  get updateDate(): string {
    return this._updateDate;
  }

  set updateDate(value: string) {
    this._updateDate = value;
    this.updateDateInfo = FormatHelper.formatDateSemantics(new Date(value));
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

  get subscriptionFreq(): CohortSubscriptionFrequency {
    return this._subscriptionFreq;
  }

  set subscriptionFreq(value: CohortSubscriptionFrequency) {
    this._subscriptionFreq = value;
  }

  get numSubjects(): number {
    return this._numSubjects;
  }

  set numSubjects(value: number) {
    this._numSubjects = value;
  }

  get diffRecords(): CohortDiffRecord[] {
    return this._diffRecords;
  }

  set diffRecords(value: CohortDiffRecord[]) {
    this._diffRecords = value;
  }

  get constraint(): Constraint {
    return this._constraint;
  }

  set constraint(value: Constraint) {
    this._constraint = value;
  }

  get controlsEnabled(): boolean {
    return this._controlsEnabled;
  }

  set controlsEnabled(value: boolean) {
    this._controlsEnabled = value;
  }
}
