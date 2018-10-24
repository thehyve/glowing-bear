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
import {Query} from "../../models/query-models/query";
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
  public queryName: string;

  /**
   * Split a newline separated string into its parts
   * and returns a patient set query where these parts are used as subject ids.
   * @param {string} fileContents the newline separated string.
   * @param {string} name the query name.
   * @return {Query} the resulting patient set query.
   */
  static processSubjectIdsUpload(fileContents: string, name: string): Query {
    let subjectIds: string[] = fileContents.split(/[\r\n]+/)
      .map(id => id.trim())
      .filter(id => id.length > 0);
    let query = new Query(null, name);
    let subjectSetConstraint = new SubjectSetConstraint();
    subjectSetConstraint.subjectIds = subjectIds;
    query.subjectQuery = subjectSetConstraint;
    query.observationQuery = {data: null};
    return query;
  }


  constructor(public queryService: CohortService,
              private constraintService: ConstraintService,) {
    this.queryName = '';
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
    return FormatHelper.formatCountNumber(this.queryService.inclusionCounts.subjectCount);
  }

  get exclusionSubjectCount(): string {
    return FormatHelper.formatCountNumber(this.queryService.exclusionCounts.subjectCount);
  }

  get rootInclusionConstraint(): CombinationConstraint {
    return this.constraintService.rootInclusionConstraint;
  }

  get rootExclusionConstraint(): CombinationConstraint {
    return this.constraintService.rootExclusionConstraint;
  }

  get subjectCount_0(): string {
    return FormatHelper.formatCountNumber(this.queryService.counts_0.subjectCount);
  }

  get subjectCount_1(): string {
    return FormatHelper.formatCountNumber(this.queryService.counts_1.subjectCount);
  }

  get subjectCount_2(): string {
    return FormatHelper.formatCountNumber(this.queryService.counts_2.subjectCount);
  }

  get subjectCountPercentage_1(): string {
    return FormatHelper.percentage(this.queryService.counts_1.subjectCount, this.queryService.counts_0.subjectCount);
  }

  get subjectCountPercentage_2(): string {
    return FormatHelper.percentage(this.queryService.counts_2.subjectCount, this.queryService.counts_1.subjectCount);
  }

  get observationCount_0(): string {
    return FormatHelper.formatCountNumber(this.queryService.counts_0.observationCount);
  }

  get observationCount_1(): string {
    return FormatHelper.formatCountNumber(this.queryService.counts_1.observationCount);
  }

  get observationCount_2(): string {
    return FormatHelper.formatCountNumber(this.queryService.counts_2.observationCount);
  }

  get observationCountPercentage_1(): string {
    return FormatHelper.percentage(this.queryService.counts_1.observationCount, this.queryService.counts_0.observationCount);
  }

  get observationCountPercentage_2(): string {
    return FormatHelper.percentage(this.queryService.counts_2.observationCount, this.queryService.counts_1.observationCount);
  }

  get isDataTableUsed(): boolean {
    return this.queryService.isDataTableUsed;
  }

  get isSavingQueryCompleted(): boolean {
    return this.queryService.isSavingQueryCompleted;
  }
  /**
   * Prevent the default behavior of node drop
   * @param event
   */
  preventNodeDrop(event) {
    event.stopPropagation();
    event.preventDefault();
  }
  saveQuery() {
    let name = this.queryName ? this.queryName.trim() : '';
    let queryNameIsValid = name !== '';
    if (queryNameIsValid) {
      this.queryService.saveQueryByName(name);
      this.queryName = '';
    } else {
      MessageHelper.alert('error', 'Please specify the query name.', '');
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

  private parseFile(file: File, data: any): Query {
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
        let query = new Query('', name);
        query.subjectQuery = TransmartConstraintMapper.generateConstraintFromObject(_json['patientsQuery']);
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
    this.queryService.update_1();
  }

  update_2(event) {
    event.stopPropagation();
    this.queryService.update_1()
      .then(() => {
        this.queryService.update_2();
      });
  }

  update_3(event) {
    event.stopPropagation();
    this.queryService.update_1()
      .then(() => {
        this.queryService.update_2()
          .then(() => {
            this.queryService.update_3();
          });
      });
  }
}
