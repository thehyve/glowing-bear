/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {of as observableOf, Observable, AsyncSubject} from 'rxjs';
import {ExportDataType} from '../../models/export-models/export-data-type';
import {ExportJob} from '../../models/export-models/export-job';

export class ExportServiceMock {
  private _exportDataTypes: ExportDataType[] = [];
  private _exportJobs: ExportJob[];
  private _exportJobName: string;
  exportEnabled: AsyncSubject<boolean> = new AsyncSubject<boolean>();
  isDataTypesUpdating = false;

  constructor() {
    this.exportEnabled.next(true);
    this.exportEnabled.complete();
  }

  updateExportJobs(): Promise<any> {
    return new Promise<any>((resolve) => {
      resolve(true);
    })
  }

  get exportDataTypes(): ExportDataType[] {
    return this._exportDataTypes;
  }

  set exportDataTypes(value: ExportDataType[]) {
    this._exportDataTypes = value;
  }

  get exportJobs(): ExportJob[] {
    return this._exportJobs;
  }

  set exportJobs(value: ExportJob[]) {
    this._exportJobs = value;
  }

  get exportJobName(): string {
    return this._exportJobName;
  }

  set exportJobName(value: string) {
    this._exportJobName = value;
  }
}
