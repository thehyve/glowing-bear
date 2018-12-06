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
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {ConstraintService} from '../../services/constraint.service';
import {FileImportHelper} from '../../utilities/file-import-helper';
import {TransmartConstraintMapper} from '../../utilities/transmart-utilities/transmart-constraint-mapper';
import {Cohort} from '../../models/cohort-models/cohort';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';

@Component({
  selector: 'gb-cohort-selection',
  templateUrl: './gb-cohort-selection.component.html',
  styleUrls: ['./gb-cohort-selection.component.css']
})
export class GbCohortSelectionComponent implements OnInit {

  @ViewChild('rootInclusionConstraintComponent') rootInclusionConstraintComponent: GbConstraintComponent;
  @ViewChild('rootExclusionConstraintComponent') rootExclusionConstraintComponent: GbConstraintComponent;

  public readonly fileElementId: string = 'subjectCriteriaFileUpload';
  private isUploadListenerNotAdded: boolean;
  public cohortName: string;
  file: File; // holds the uploaded subject file

  constructor(private cohortService: CohortService,
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

  get subjectCount(): string {
    return FormatHelper.formatCountNumber(this.cohortService.counts.subjectCount);
  }

  get observationCount(): string {
    return FormatHelper.formatCountNumber(this.cohortService.counts.observationCount);
  }

  get isSavingCohortCompleted(): boolean {
    return this.cohortService.isSavingCohortCompleted;
  }

  get isUpdating(): boolean {
    return this.cohortService.isUpdatingCurrent;
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
    this.cohortService.updateCurrent();
  }

  importCriteria() {
    let reader = new FileReader();
    reader.onload = this.handleCriteriaFileUploadEvent.bind(this);
    FileImportHelper.importCriteria(this.fileElementId, reader, this.isUploadListenerNotAdded);
    this.isUploadListenerNotAdded = false;
  }

  handleCriteriaFileUploadEvent(e) {
    let data = e.target['result'];
    this.file = FileImportHelper.getFile(this.fileElementId);
    if (FileImportHelper.isTextFile) {
      this.processSubjectIdsUpload(data as string, this.file.name);
    } else if (FileImportHelper.isJsonFile(this.file)) {
      let name = this.file.name.substr(0, this.file.name.indexOf('.'));
      this.processCohortUpload(data, name);
    } else {
      MessageHelper.alert('error', 'Invalid file format for subjects import.');
      return;
    }
  }

  /**
   * Split a newline separated string (list of subject ids) into its parts
   * and restores subject set query where these parts are used as subject ids.
   * @param {string} fileContents the newline separated string.
   * @param {string} name the query name.
   */
  private processSubjectIdsUpload(fileContents: string, name: string) {
    let subjectIds: string[] = fileContents.split(/[\r\n]+/)
      .map(id => id.trim())
      .filter(id => id.length > 0);
    let cohort = new Cohort(null, name);
    let subjectSetConstraint = new SubjectSetConstraint();
    subjectSetConstraint.subjectIds = subjectIds;
    cohort.constraint = subjectSetConstraint;
    this.cohortService.restoreCohort(cohort);
  }

  private processCohortUpload(data, name: string) {
    let _json = JSON.parse(data);
    if (_json['constraints']) {
      let cohort = new Cohort('', name);
      cohort.constraint = TransmartConstraintMapper.generateConstraintFromObject(data['constraint']);
      this.cohortService.restoreCohort(cohort);
    } else {
      MessageHelper.alert('error', 'Invalid file content for subjects import.');
    }
  }

}
