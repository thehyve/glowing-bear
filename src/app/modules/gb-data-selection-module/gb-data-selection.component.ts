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
import {AppConfig} from '../../config/app.config';
import {MedcoQueryType} from "../../models/picsure-models/i2b2-medco/medco-query-type";
import {Observable} from "rxjs";

@Component({
  selector: 'gb-data-selection',
  templateUrl: './gb-data-selection.component.html',
  styleUrls: ['./gb-data-selection.component.css']
})
export class GbDataSelectionComponent implements OnInit {

  constructor(public queryService: QueryService) {
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

  get isVariableSelectionUsed(): boolean {
    return this.queryService.isVariableSelectionUsed;
  }

  get isQuerySavingUsed(): boolean {
    return this.queryService.isQuerySavingUsed;
  }

  get availableQueryTypes(): Observable<MedcoQueryType[]> {
    return this.queryService.availableQueryTypes;
  }

  get selectedQueryType(): MedcoQueryType {
    return this.queryService.selectedQueryType;
  }

  set selectedQueryType(queryType: MedcoQueryType) {
    this.queryService.selectedQueryType = queryType;
  }

  update_1(event) {
    event.stopPropagation();
    this.queryService.update_1();
  }

  update_2(event) {
    event.stopPropagation();
    this.queryService.update_2();
  }

  update_3(event) {
    event.stopPropagation();
    this.queryService.update_3();
  }
}
