import {DataTableService} from '../app/services/data-table.service';
import {TreeNodeService} from '../app/services/tree-node.service';
import {ExportService} from '../app/services/export.service';
import {CrossTableService} from '../app/services/cross-table.service';
import {TestBed} from '@angular/core/testing';
import {NavbarService} from '../app/services/navbar.service';
import {ConstraintService} from '../app/services/constraint.service';
import {ResourceServiceMock} from '../app/services/mocks/resource.service.mock';
import {QueryService} from '../app/services/query.service';
import {ResourceService} from '../app/services/resource.service';
import {DatePipe} from '@angular/common';
import {ExportDataType} from '../app/models/export-models/export-data-type';
import {ExportFileFormat} from '../app/models/export-models/export-file-format';
import {ExportJob} from '../app/models/export-models/export-job';
import {StudyService} from '../app/services/study.service';
import {AuthenticationService} from '../app/services/authentication/authentication.service';
import {AuthenticationServiceMock} from '../app/services/mocks/authentication.service.mock';

describe('Integration test for data export', () => {

  let resourceService: ResourceService;
  let exportService: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
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
        QueryService,
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
    let spy1 = spyOn(resourceService, 'createExportJob').and.callThrough();
    exportService.createExportJob();
    expect(spy1).not.toHaveBeenCalled();

    exportService.exportJobs = [];
    let dataType = new ExportDataType('test data type name', true);
    let fileFormat = new ExportFileFormat('tsv', true);
    dataType.fileFormats.push(fileFormat);
    exportService.exportDataTypes.push(dataType);
    let promise = exportService.createExportJob();
    promise.then(() => {
      expect(spy1).toHaveBeenCalled();
      expect(exportService.exportJobs).toBeDefined();
      expect(exportService.exportJobs.length).toBe(1);
    });
  });

});
