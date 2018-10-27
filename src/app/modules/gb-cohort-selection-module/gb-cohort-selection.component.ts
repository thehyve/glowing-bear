/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit, ViewChild} from '@angular/core';
import {FormatHelper} from '../../utilities/format-helper';
import {CohortService} from '../../services/cohort.service';
import {MessageHelper} from '../../utilities/message-helper';
import {GbConstraintComponent} from './constraint-components/gb-constraint/gb-constraint.component';
import {Cohort} from '../../models/cohort-models/cohort';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {ConstraintService} from '../../services/constraint.service';
import {TransmartConstraintMapper} from '../../utilities/transmart-utilities/transmart-constraint-mapper';

@Component({
  selector: 'gb-cohort-selection',
  templateUrl: './gb-cohort-selection.component.html',
  styleUrls: ['./gb-cohort-selection.component.css']
})
export class GbCohortSelectionComponent implements OnInit {

  @ViewChild('rootInclusionConstraintComponent') rootInclusionConstraintComponent: GbConstraintComponent;
  @ViewChild('rootExclusionConstraintComponent') rootExclusionConstraintComponent: GbConstraintComponent;

  private isUploadListenerNotAdded: boolean;
  public cohortName: string;

  constructor(public cohortService: CohortService,
              private constraintService: ConstraintService) {
    this.cohortName = '';
    this.isUploadListenerNotAdded = true;
  }

  ngOnInit() {
  }

  /**
   * The event handler for the accordion tab open event,
   * to access the accordion, use event.index
   * @param event
   */
  openAccordion(event) {
  }

  /**
   * The event handler for the accordion tab close event,
   * to access the accordion, use event.index
   * @param event
   */
  closeAccordion(event) {
  }

  get inclusionSubjectCount(): string {
    return FormatHelper.formatCountNumber(this.cohortService.inclusionCounts.subjectCount);
  }

  get exclusionSubjectCount(): string {
    return FormatHelper.formatCountNumber(this.cohortService.exclusionCounts.subjectCount);
  }

  get rootInclusionConstraint(): CombinationConstraint {
    return this.constraintService.rootInclusionConstraint;
  }

  get rootExclusionConstraint(): CombinationConstraint {
    return this.constraintService.rootExclusionConstraint;
  }

  get totalSubjectCount(): string {
    return FormatHelper.formatCountNumber(this.cohortService.totalCounts.subjectCount);
  }

  get subjectCount(): string {
    return FormatHelper.formatCountNumber(this.cohortService.counts.subjectCount);
  }

  get totalObservationCount(): string {
    return FormatHelper.formatCountNumber(this.cohortService.totalCounts.observationCount);
  }

  get observationCount(): string {
    return FormatHelper.formatCountNumber(this.cohortService.counts.observationCount);
  }

  get isSavingCohortCompleted(): boolean {
    return this.cohortService.isSavingCohortCompleted;
  }

  get isUpdating(): boolean {
    return this.cohortService.isUpdating;
  }

  get isDirty(): boolean {
    return this.cohortService.isDirty;
  }

  /**
   * Prevent the default behavior of node drop
   * @param event
   */
  preventNodeDrop(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  saveCohort() {
    let name = this.cohortName ? this.cohortName.trim() : '';
    const isNameValid = name !== '';
    if (isNameValid) {
      this.cohortService.saveCohortByName(name);
      this.cohortName = '';
    } else {
      MessageHelper.alert('error', 'Please specify the cohort name.', '');
    }
  }

  update(event) {
    event.stopPropagation();
    this.cohortService.update();
  }

}
