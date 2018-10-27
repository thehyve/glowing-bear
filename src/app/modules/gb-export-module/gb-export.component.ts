/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {ExportJob} from '../../models/export-models/export-job';
import {AppConfig} from '../../config/app.config';
import {ExportService} from '../../services/export.service';
import {ExportDataType} from '../../models/export-models/export-data-type';
import Timer = NodeJS.Timer;

@Component({
  selector: 'gb-export',
  templateUrl: './gb-export.component.html',
  styleUrls: ['./gb-export.component.css']
})
export class GbExportComponent implements OnInit, OnDestroy {

  private timer: Timer;

  // TODO: fix export workflow:
  // 1. user defines cohort in cohort selection
  // 2. user goes to export tab, variables on the left are selectable
  // 3. based on cohort and variables, compose combination constraint to get data table
  // 4. user arranges data table
  // 5. user selects export data type, defines export job
  constructor(private appConfig: AppConfig,
              private exportService: ExportService) {
  }

  ngOnInit() {
    this.exportService.updateExportJobs();
    this.timer = setInterval(() => this.exportService.updateExportJobs(), 30 * 1000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  createExportJob() {
    this.exportService.createExportJob();
  }

  downloadExportJob(job) {
    this.exportService.downloadExportJob(job);
  }

  cancelExportJob(job) {
    this.exportService.cancelExportJob(job);
  }

  archiveExportJob(job) {
    this.exportService.archiveExportJob(job)
  }

  onExportJobNameInputDrop(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  get exportJobName(): string {
    return this.exportService.exportJobName;
  }

  set exportJobName(value: string) {
    this.exportService.exportJobName = value;
  }

  get isExternalExportAvailable(): boolean {
    return this.appConfig.getConfig('export-mode')['name'] !== 'transmart';
  }

  get isTransmartSurveyTableDataView(): boolean {
    let exportMode =  this.appConfig.getConfig('export-mode');
    return exportMode['name'] === 'transmart' && exportMode['data-view'] === 'surveyTable';
  }

  get isTransmartDateColumnIncluded(): boolean {
    return this.exportService.isTransmartDateColumnsIncluded;
  }

  set isTransmartDateColumnIncluded(value: boolean) {
    this.exportService.isTransmartDateColumnsIncluded = value;
  }

  get exportDataTypes(): ExportDataType[] {
    return this.exportService.exportDataTypes;
  }

  get exportJobs(): ExportJob[] {
    return this.exportService.exportJobs;
  }

  get isLoadingExportDataTypes(): boolean {
    return this.exportService.isLoadingExportDataTypes;
  }
}
