/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Observable, of as observableOf} from 'rxjs';
import {ExportJob} from '../../models/export-models/export-job';
import {Constraint} from '../../models/constraint-models/constraint';
import {TransmartPackerJob} from '../../models/transmart-packer-models/transmart-packer-job';

export class TransmartPackerHttpServiceMock {
  private exportJobs: ExportJob[];

  constructor() {
    this.exportJobs = [];
  }

  getAllJobs(): Observable<ExportJob[]> {
    return observableOf(this.exportJobs);
  }

  getExportDataTypes(): Observable<string[]> {
    return observableOf([]);
  }

  runJob(jobName: string, targetConstraint: Constraint): Observable<TransmartPackerJob> {
    return observableOf(null);
  }
}
