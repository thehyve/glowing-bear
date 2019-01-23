/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit, ElementRef} from '@angular/core';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {Cohort} from '../../../../models/cohort-models/cohort';
import {CohortService} from '../../../../services/cohort.service';
import {CohortDiffRecord} from '../../../../models/cohort-models/cohort-diff-record';
import {DownloadHelper} from '../../../../utilities/download-helper';
import {ConfirmationService} from 'primeng/primeng';
import {UIHelper} from '../../../../utilities/ui-helper';
import {ConstraintHelper} from '../../../../utilities/constraint-utilities/constraint-helper';
import {MessageHelper} from '../../../../utilities/message-helper';
import {FormatHelper} from '../../../../utilities/format-helper';
import {FileImportHelper} from '../../../../utilities/file-import-helper';
import {SubjectSetConstraint} from '../../../../models/constraint-models/subject-set-constraint';
import {TransmartConstraintMapper} from '../../../../utilities/transmart-utilities/transmart-constraint-mapper';

@Component({
  selector: 'gb-cohorts',
  templateUrl: './gb-cohorts.component.html',
  styleUrls: ['./gb-cohorts.component.css']
})
export class GbCohortsComponent implements OnInit {

  public readonly fileElementId: string = 'cohortFileUpload';
  searchTerm = '';
  isUploadListenerNotAdded: boolean;
  file: File; // holds the uploaded cohort file

  constructor(public treeNodeService: TreeNodeService,
              private cohortService: CohortService,
              private element: ElementRef,
              private confirmationService: ConfirmationService) {
    this.isUploadListenerNotAdded = true;
  }

  ngOnInit() {
  }

  importCohort() {
    let reader = new FileReader();
    reader.onload = this.handleCohortImport.bind(this);
    FileImportHelper.importCriteria(this.fileElementId, reader, this.isUploadListenerNotAdded);
    this.isUploadListenerNotAdded = false;
  }

  handleCohortImport(e) {
    MessageHelper.alert('info', 'File upload successful!');
    let data = e.target['result'];
    this.file = FileImportHelper.getFile(this.fileElementId);
    if (FileImportHelper.isTextFile(this.file)) {
      this.processSubjectIdsUpload(data as string, this.file.name);
    } else if (FileImportHelper.isJsonFile(this.file)) {
      let name = this.file.name.substr(0, this.file.name.indexOf('.'));
      this.processCohortUpload(data, name);
    } else {
      MessageHelper.alert('error', 'Invalid file for cohort import.');
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
      MessageHelper.alert('error', 'Invalid json format for cohort import.');
    }
  }

  toggleSubscription(event: Event, target: Cohort) {
    event.stopPropagation();
    this.cohortService.toggleCohortSubscription(target);
  }

  getSubscriptionButtonIcon(target: Cohort) {
    return target.subscribed ? 'fa fa-rss-square' : 'fa fa-rss';
  }

  toggleBookmark(event: Event, target: Cohort) {
    event.stopPropagation();
    this.cohortService.toggleCohortBookmark(target);
  }

  getBookmarkButtonIcon(target: Cohort) {
    return target.bookmarked ? 'fa fa-star' : 'fa fa-star-o';
  }

  restoreCohort(event: Event, selected: Cohort) {
    event.stopPropagation();
    this.cohortService.restoreCohort(selected);
  }

  toggleSubscriptionPanel(target: Cohort) {
    target.subscriptionCollapsed = !target.subscriptionCollapsed;
  }

  toggleSubscriptionRecordPanel(record: CohortDiffRecord) {
    record.showCompleteRepresentation = !record.showCompleteRepresentation;
  }

  removeCohort(event: Event, target: Cohort) {
    event.stopPropagation();
    this.cohortService.deleteCohort(target);
  }

  confirmRemoval(event: Event, target: Cohort) {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove the cohort?',
      header: 'Delete Confirmation',
      icon: 'fa fa-trash',
      accept: () => {
        this.removeCohort(event, target);
      },
      reject: () => {
        MessageHelper.alert('error', `Cannot remove the cohort ${target.name}`);
      }
    });
  }

  downloadCohort(event: Event, target: Cohort) {
    event.stopPropagation();
    DownloadHelper.downloadJSON(ConstraintHelper.mapCohortToObject(target), target.name);
  }

  radioCheckSubscriptionFrequency(event: MouseEvent, target: Cohort) {
    event.stopPropagation();
    event.preventDefault();
    let obj = {
      subscriptionFreq: target.subscriptionFreq
    };
    this.cohortService.editCohort(target, obj);
  }

  downloadSubscriptionRecord(target: Cohort, record: CohortDiffRecord) {
    const filename = target.name + '-record-' + record.createDate;
    DownloadHelper.downloadJSON(record.completeRepresentation, filename);
  }

  onFiltering(event) {
    let filterWord = this.searchTerm.trim().toLowerCase();
    for (let c of this.cohortService.cohorts) {
      if (c.name.toLowerCase().indexOf(filterWord) === -1) {
        c.visible = false;
      } else {
        c.visible = true;
      }
    }
    UIHelper.removePrimeNgLoaderIcon(this.element, 500);
  }

  clearFilter() {
    this.searchTerm = '';
    for (let c of this.cohortService.cohorts) {
      c.visible = true;
    }
    UIHelper.removePrimeNgLoaderIcon(this.element, 500);
  }

  get cohorts(): Cohort[] {
    return this.cohortService.cohorts;
  }

  sortByName() {
    this.cohorts.sort((q1, q2) => {
      if (q1.name > q2.name) {
        return 1;
      } else if (q1['name'] < q2['name']) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  sortBySubscription() {
    this.cohorts.sort((q1, q2) => {
      if (!q1.subscribed && q2.subscribed) {
        return 1;
      } else if (q1.subscribed && !q2.subscribed) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  sortByDate() {
    this.cohorts.sort((q1, q2) => {
      if (q1.updateDate > q2.updateDate) {
        return 1;
      } else if (q1.updateDate < q2.updateDate) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  sortByBookmark() {
    this.cohorts.sort((q1, q2) => {
      if (q1.bookmarked && !q2.bookmarked) {
        return -1;
      } else if (!q1.bookmarked && q2.bookmarked) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  onCohortCheckClick(e: MouseEvent) {
    e.stopPropagation();
    this.cohortService.updateCountsWithAllCohorts();
  }

  get isCohortSubscriptionIncluded(): boolean {
    return this.cohortService.isCohortSubscriptionIncluded;
  }

  get subjectCountText(): string {
    const count = this.cohortService.allCounts.subjectCount;
    const countString = (this.cohortService.isUpdatingCurrent || this.cohortService.isUpdatingAll) ?
      '...' : FormatHelper.formatCountNumber(count);
    return count === 1 ? countString + ' subject selected' : countString + ' subjects selected';
  }

  get isTreeNodesLoadingCompleted(): boolean {
    return this.treeNodeService.isTreeNodesLoadingCompleted;
  }
}
