import {DataTableService} from '../app/services/data-table.service';
import {TreeNodeService} from '../app/services/tree-node.service';
import {ExportService} from '../app/services/export.service';
import {CrossTableService} from '../app/services/cross-table.service';
import {TestBed} from '@angular/core/testing';
import {NavbarService} from '../app/services/navbar.service';
import {ConstraintService} from '../app/services/constraint.service';
import {ResourceServiceMock} from '../app/services/mocks/resource.service.mock';
import {CohortService} from '../app/services/cohort.service';
import {ResourceService} from '../app/services/resource.service';
import {DatePipe} from '@angular/common';
import {ExportJob} from '../app/models/export-models/export-job';
import {StudyService} from '../app/services/study.service';
import {AuthenticationService} from '../app/services/authentication/authentication.service';
import {AuthenticationServiceMock} from '../app/services/mocks/authentication.service.mock';
import {AppConfigMock} from '../app/config/app.config.mock';
import {AppConfig} from '../app/config/app.config';

describe('Integration test for data export', () => {

  let resourceService: ResourceService;
  let exportService: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AppConfig,
          useClass: AppConfigMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceMock
        },
        TreeNodeService,
        ConstraintService,
        DataTableService,
        CrossTableService,
        ExportService,
        StudyService,
        CohortService,
        NavbarService,
        DatePipe
      ]
    });
    resourceService = TestBed.get(ResourceService);
    exportService = TestBed.get(ExportService);
  });

  it('should create and update an export job', () => {
    exportService.exportJobs = null;
    let newExportJob = new ExportJob();
    newExportJob.id = 'id1';
    newExportJob.jobName = 'test job name 1';
    exportService.exportJobName = 'test export name 1';
    let spyCreate = spyOn(resourceService, 'createExportJob').and.callThrough();
    let spyValidate = spyOn(exportService, 'validateExportJob', ).and.returnValue(true);
    let spyRun = spyOn(resourceService, 'runExportJob').and.callThrough();
    let spyGet = spyOn(resourceService, 'getExportJobs').and.callThrough();
    exportService.createExportJob()
      .then(() => {
        expect(spyCreate).toHaveBeenCalled();
        expect(spyValidate).toHaveBeenCalled();
        expect(spyRun).toHaveBeenCalled();
        expect(spyGet).toHaveBeenCalled();
        expect(exportService.exportJobs).toBeDefined();
        expect(exportService.exportJobs.length).toBe(1);
      })
      .catch(err => {
        fail('should have created and updated the export job but failed to do so.');
      });
  });

});
