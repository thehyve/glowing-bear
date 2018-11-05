/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed, inject} from '@angular/core/testing';

import {ExportService} from './export.service';
import {ConstraintService} from './constraint.service';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {DataTableService} from './data-table.service';
import {DataTableServiceMock} from './mocks/data-table.service.mock';
import {ExportJob} from '../models/export-models/export-job';
import {ExportDataType} from '../models/export-models/export-data-type';
import {ExportFileFormat} from '../models/export-models/export-file-format';
import {QueryService} from './query.service';
import {QueryServiceMock} from './mocks/query.service.mock';
import {CountItem} from '../models/aggregate-models/count-item';
import {AuthenticationService} from './authentication/authentication.service';
import {AuthenticationServiceMock} from './mocks/authentication.service.mock';
import {StudyService} from './study.service';
import {StudyServiceMock} from './mocks/study.service.mock';

describe('ExportService', () => {
  let exportService: ExportService;
  let queryService: QueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceMock
        },
        {
          provide: StudyService,
          useClass: StudyServiceMock
        },
        {
          provide: DataTableService,
          useClass: DataTableServiceMock
        },
        {
          provide: QueryService,
          useClass: QueryServiceMock
        },
        ExportService
      ]
    });
    exportService = TestBed.get(ExportService);
    queryService = TestBed.get(QueryService);
  });

  it('should be injected', inject([ExportService], (service: ExportService) => {
    expect(service).toBeTruthy();
  }));

  it('should validate export job name', () => {
    let newExportJob = new ExportJob();
    newExportJob.id = 'id';
    newExportJob.jobName = 'test job name';
    exportService.exportJobs = [newExportJob];
    let result = exportService.validateExportJob('');
    expect(result).toBe(false);
    result = exportService.validateExportJob('test job name');
    expect(result).toBe(false);
    result = exportService.validateExportJob('test job name 1');
    expect(result).toBe(false);
    let exportDataType = new ExportDataType('test data type', true);
    exportService.exportDataTypes = [exportDataType];
    result = exportService.validateExportJob('test job name 1');
    expect(result).toBe(false);
    let fileFormat = new ExportFileFormat('tsv', true);
    exportDataType.fileFormats.push(fileFormat);
    result = exportService.validateExportJob('test job name 1');
    expect(result).toBe(false);
    queryService.counts_2 = new CountItem(1, 1);
    result = exportService.validateExportJob('test job name 1');
    expect(result).toBe(true);
    queryService.counts_2 = new CountItem(0, 0);
    result = exportService.validateExportJob('test job name 1');
    expect(result).toBe(false);
  });

});
