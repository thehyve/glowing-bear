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
import {CohortService} from './cohort.service';
import {CohortServiceMock} from './mocks/cohort.service.mock';
import {CountItem} from '../models/aggregate-models/count-item';
import {AuthenticationService} from './authentication/authentication.service';
import {AuthenticationServiceMock} from './mocks/authentication.service.mock';
import {StudyService} from './study.service';
import {StudyServiceMock} from './mocks/study.service.mock';
import {Observable} from 'rxjs';

describe('ExportService', () => {
  let exportService: ExportService;
  let cohortService: CohortService;
  let resourceService: ResourceService;
  let exportJob: ExportJob;

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
          provide: CohortService,
          useClass: CohortServiceMock
        },
        ExportService
      ]
    });
    resourceService = TestBed.get(ResourceService);
    exportService = TestBed.get(ExportService);
    cohortService = TestBed.get(CohortService);
    exportJob = new ExportJob();
    exportJob.id = 'id';
    exportJob.name = 'test job name';
  });

  it('should be injected', inject([ExportService], (service: ExportService) => {
    expect(service).toBeTruthy();
  }));

  it('should validate export job name', () => {
    exportService.exportJobs = [exportJob];
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
  });

  it('should cancel export job', () => {
    let spy = spyOn(resourceService, 'cancelExportJob').and.callThrough();
    let spy1 = spyOn(exportService, 'updateExportJobs').and.callThrough();
    exportService.cancelExportJob(exportJob)
      .then(() => {
        expect(spy).toHaveBeenCalled();
        expect(spy1).toHaveBeenCalled();
      })
      .catch(err => {
        fail('should have succeeded canceling export job but failed');
      });
  })

  it('should handle error when canceling export job', () => {
    let spy = spyOn(resourceService, 'cancelExportJob').and.callFake(() => {
      return Observable.throwError('');
    });
    let spy1 = spyOn(exportService, 'updateExportJobs').and.callThrough();
    exportService.cancelExportJob(exportJob)
      .then(() => {
        fail('should have been handling error rather than succeeding in canceling export job');
      })
      .catch(err => {
        expect(spy).toHaveBeenCalled();
        expect(spy1).not.toHaveBeenCalled();
      })
  });

  it('should archive export job', () => {
    let spy = spyOn(resourceService, 'archiveExportJob').and.callThrough();
    let spy1 = spyOn(exportService, 'updateExportJobs').and.callThrough();
    exportService.archiveExportJob(exportJob)
      .then(() => {
        expect(spy).toHaveBeenCalled();
        expect(spy1).toHaveBeenCalled();
      })
      .catch(err => {
        fail('should have succeeded archiving export job but failed');
      });
  });

  it('should handle error when archiving export job', () => {
    let spy = spyOn(resourceService, 'archiveExportJob').and.callFake(() => {
      return Observable.throwError('');
    });
    let spy1 = spyOn(exportService, 'updateExportJobs').and.callThrough();
    exportService.archiveExportJob(exportJob)
      .then(() => {
        fail('should have been handling error rather than succeeding in archiving export job');
      })
      .catch(err => {
        expect(spy).toHaveBeenCalled();
        expect(spy1).not.toHaveBeenCalled();
      })
  });

  it('should update export jobs', () => {
    let spy = spyOn(resourceService, 'getExportJobs').and.callThrough();
    exportService.updateExportJobs()
      .then(() => {
        expect(spy).toHaveBeenCalled();
      })
      .catch(err => {
        fail('should have succeeded archiving export job but failed');
      });
  });

  it('should handle error when updating export jobs', () => {
    let spy = spyOn(resourceService, 'getExportJobs').and.callFake(() => {
      return Observable.throwError('');
    });
    exportService.updateExportJobs()
      .then(() => {
        fail('should have been handling error rather than succeeding in updating export jobs');
      })
      .catch(err => {
        expect(spy).toHaveBeenCalled();
      })
  });
});
