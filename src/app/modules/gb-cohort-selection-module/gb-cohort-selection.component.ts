/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {FormatHelper} from '../../utilities/format-helper';
import {QueryService} from '../../services/query.service';
import {MessageHelper} from '../../utilities/message-helper';

@Component({
  selector: 'gb-cohort-selection',
  templateUrl: './gb-cohort-selection.component.html',
  styleUrls: ['./gb-cohort-selection.component.css']
})
export class GbCohortSelectionComponent implements OnInit {
  public queryName: string;

  constructor(public queryService: QueryService) {
    this.queryName = '';
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
