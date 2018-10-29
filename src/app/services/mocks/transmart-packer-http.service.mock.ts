/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {of as observableOf, Observable} from 'rxjs';
import {ExportJob} from '../../models/export-models/export-job';
import {Query} from '../../models/query-models/query';
import {TransmartCrossTable} from '../../models/transmart-models/transmart-cross-table';
import {Constraint} from '../../models/constraint-models/constraint';
import {TransmartTableState} from '../../models/transmart-models/transmart-table-state';
import {TransmartDataTable} from '../../models/transmart-models/transmart-data-table';
import {TransmartStudy} from '../../models/transmart-models/transmart-study';
import {SubjectSet} from '../../models/constraint-models/subject-set';
import {TransmartCountItem} from '../../models/transmart-models/transmart-count-item';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {TransmartConstraintMapper} from '../../utilities/transmart-utilities/transmart-constraint-mapper';
import {Pedigree} from '../../models/constraint-models/pedigree';
import {TransmartQuery} from '../../models/transmart-models/transmart-query';

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

}
