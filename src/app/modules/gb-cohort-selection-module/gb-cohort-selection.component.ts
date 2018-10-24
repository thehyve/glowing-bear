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
import {GbConstraintComponent} from "./constraint-components/gb-constraint/gb-constraint.component";
import {Cohort} from "../../models/cohort-models/cohort";
import {SubjectSetConstraint} from "../../models/constraint-models/subject-set-constraint";
import {CombinationConstraint} from "../../models/constraint-models/combination-constraint";
import {ConstraintService} from "../../services/constraint.service";
import {TransmartConstraintMapper} from "../../utilities/transmart-utilities/transmart-constraint-mapper";

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

  /**
   * Split a newline separated string into its parts
   * and returns a patient set cohort where these parts are used as subject ids.
   * @param {string} fileContents the newline separated string.
   * @param {string} name the cohort name.
   * @return {Cohort} the resulting patient set cohort.
   */
  static processSubjectIdsUpload(fileContents: string, name: string): Cohort {
    let subjectIds: string[] = fileContents.split(/[\r\n]+/)
      .map(id => id.trim())
      .filter(id => id.length > 0);
    let cohort = new Cohort(null, name);
    let subjectSetConstraint = new SubjectSetConstraint();
    subjectSetConstraint.subjectIds = subjectIds;
    cohort.constraint = subjectSetConstraint;
    return cohort;
  }


  constructor(public cohortService: CohortService,
              private constraintService: ConstraintService,) {
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

  get subjectCount_0(): string {
    return FormatHelper.formatCountNumber(this.cohortService.counts_0.subjectCount);
  }

  get subjectCount_1(): string {
    return FormatHelper.formatCountNumber(this.cohortService.counts_1.subjectCount);
  }

  get subjectCount_2(): string {
    return FormatHelper.formatCountNumber(this.cohortService.counts_2.subjectCount);
  }

  get subjectCountPercentage_1(): string {
    return FormatHelper.percentage(this.cohortService.counts_1.subjectCount, this.cohortService.counts_0.subjectCount);
  }

  get subjectCountPercentage_2(): string {
    return FormatHelper.percentage(this.cohortService.counts_2.subjectCount, this.cohortService.counts_1.subjectCount);
  }

  get observationCount_0(): string {
    return FormatHelper.formatCountNumber(this.cohortService.counts_0.observationCount);
  }

  get observationCount_1(): string {
    return FormatHelper.formatCountNumber(this.cohortService.counts_1.observationCount);
  }

  get observationCount_2(): string {
    return FormatHelper.formatCountNumber(this.cohortService.counts_2.observationCount);
  }

  get observationCountPercentage_1(): string {
    return FormatHelper.percentage(this.cohortService.counts_1.observationCount, this.cohortService.counts_0.observationCount);
  }

  get observationCountPercentage_2(): string {
    return FormatHelper.percentage(this.cohortService.counts_2.observationCount, this.cohortService.counts_1.observationCount);
  }

  get isDataTableUsed(): boolean {
    return this.cohortService.isDataTableUsed;
  }

  get isSavingCohortCompleted(): boolean {
    return this.cohortService.isSavingCohortCompleted;
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

  importCriteria() {
    let uploadElm = document.getElementById('step1CriteriaFileUpload');
    if (this.isUploadListenerNotAdded) {
      uploadElm
        .addEventListener('change', this.criteriaFileUpload.bind(this), false);
      this.isUploadListenerNotAdded = false;
    }
    // reset the input path so that it will take the same file again
    uploadElm['value'] = '';
    uploadElm.click();
  }

  criteriaFileUpload(event) {
    let reader = new FileReader();
    let file: File = event.target.files[0];
    reader.onload = (function (e: Event) {
      let data = e.target['result'];
      let query = this.parseFile(file, data);
      this.queryService.restoreQuery(query);
    }).bind(this);
    reader.readAsText(file);
  }

  private parseFile(file: File, data: any): Cohort {
    if (file.type === 'text/plain' ||
      file.type === 'text/tab-separated-values' ||
      file.type === 'text/csv' ||
      (file.type === '' && file.name.split('.').pop() !== 'json')) {
      // we assume the text contains a list of subject Ids
      return GbCohortSelectionComponent.processSubjectIdsUpload(data as string, file.name);
    } else if (file.type === 'application/json' || file.name.split('.').pop() === 'json') {
      let _json = JSON.parse(data);
      // If the json is of standard format
      if (_json['patientsQuery']) {
        let name = file.name.substr(0, file.name.indexOf('.'));
        let query = new Cohort('', name);
        query.constraint = TransmartConstraintMapper.generateConstraintFromObject(_json['patientsQuery']);
        return query;
      } else {
        MessageHelper.alert('error', 'Invalid file content for query import.');
        return;
      }
    } else {
      MessageHelper.alert('error', 'Invalid file format for STEP 1.');
      return;
    }
  }

  update_1(event) {
    event.stopPropagation();
    this.cohortService.update_1();
  }

  update_2(event) {
    event.stopPropagation();
    this.cohortService.update_1()
      .then(() => {
        this.cohortService.update_2();
      });
  }

  update_3(event) {
    event.stopPropagation();
    this.cohortService.update_1()
      .then(() => {
        this.cohortService.update_2()
          .then(() => {
            this.cohortService.update_3();
          });
      });
  }
}
