import {inject, TestBed} from '@angular/core/testing';
import {of as observableOf} from 'rxjs';
import {TransmartResourceService} from './transmart-resource.service';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock} from '../../config/app.config.mock';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {Concept} from '../../models/constraint-models/concept';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {TransmartHttpService} from './transmart-http.service';
import {TransmartHttpServiceMock} from '../mocks/transmart-http.service.mock';
import {TransmartPackerHttpService} from './transmart-packer-http.service';
import {TransmartPackerHttpServiceMock} from '../mocks/transmart-packer-http.service.mock';
import {DataTable} from '../../models/table-models/data-table';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {TransmartStudyDimensions} from '../../models/transmart-models/transmart-study-dimensions';
import {Dimension} from '../../models/table-models/dimension';
import {ExportDataType} from '../../models/export-models/export-data-type';
import {ExportFileFormat} from '../../models/export-models/export-file-format';

describe('TransmartResourceService', () => {

  let transmartResourceService: TransmartResourceService;
  let transmartHttpService: TransmartHttpService;
  let transmartPackerHttpService: TransmartPackerHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TransmartResourceService,
        {
          provide: AppConfig,
          useClass: AppConfigMock
        },
        {
          provide: TransmartHttpService,
          useClass: TransmartHttpServiceMock
        },
        {
          provide: TransmartPackerHttpService,
          useClass: TransmartPackerHttpServiceMock
        },
      ]
    });
    transmartResourceService = TestBed.get(TransmartResourceService);
    transmartHttpService = TestBed.get(TransmartHttpService);
    transmartPackerHttpService = TestBed.get(TransmartPackerHttpService);
  });

  it('should be injected',
    inject([TransmartResourceService], (service: TransmartResourceService) => {
      expect(service).toBeTruthy();
    }));

  it('should run transmart export job for survey table view', () => {
    transmartResourceService.useExternalExportJob = false;

    // with auto saved subject set, no table state
    const jobId = 'foo';
    const jobName = 'bar';
    transmartResourceService.autosaveSubjectSets = true;
    transmartResourceService.subjectSetConstraint = new SubjectSetConstraint();
    transmartResourceService.subjectSetConstraint.subjectIds = ['id1', 'id2'];
    const mockConstraint = new CombinationConstraint();
    const c1 = new ConceptConstraint();
    c1.concept = new Concept();
    const c2 = new ConceptConstraint();
    c2.concept = new Concept();
    (<CombinationConstraint>mockConstraint).addChild(c1);
    (<CombinationConstraint>mockConstraint).addChild(c2);
    const exportSurveyTableSpy = spyOn(transmartHttpService, 'runSurveyTableExportJob').and.callFake(() => {
      return observableOf(null);
    });
    transmartResourceService.exportDataView = 'surveyTable';
    const dataType = new ExportDataType('clinical', true);
    dataType.fileFormats.push(new ExportFileFormat('TSV', true));
    dataType.fileFormats.push(new ExportFileFormat('SPSS', true));
    transmartResourceService.runExportJob(jobId, jobName, mockConstraint, [dataType], null, false);
    expect(exportSurveyTableSpy).toHaveBeenCalled();
  });

  it('should run transmart export job for data table view', () => {
    transmartResourceService.useExternalExportJob = false;

    // with auto saved subject set, no table state
    const jobId = 'foo';
    const jobName = 'bar';
    transmartResourceService.autosaveSubjectSets = false;
    const mockConstraint = new ConceptConstraint();
    mockConstraint.concept = new Concept();

    const exportSpy = spyOn(transmartHttpService, 'runExportJob').and.callFake(() => {
      return observableOf(null);
    });
    transmartResourceService.exportDataView = 'dataTable';
    const table = new DataTable();
    table.rowDimensions = [new Dimension('patient')];
    table.columnDimensions = [new Dimension(('concept'))];
    const dataType = new ExportDataType('clinical', true);
    dataType.fileFormats.push(new ExportFileFormat('TSV', true));
    transmartResourceService.runExportJob(jobId, jobName, mockConstraint, [dataType], table, false);
    expect(exportSpy).toHaveBeenCalled();
  });

  it('should run transmart export job for uninitialised data table view', (done) => {
    transmartResourceService.useExternalExportJob = false;
    // with auto saved subject set, no table state
    const jobId = 'foo';
    const jobName = 'bar';
    transmartResourceService.autosaveSubjectSets = false;
    const mockConstraint = new ConceptConstraint();
    mockConstraint.concept = new Concept();

    const dimensions = new TransmartStudyDimensions();
    dimensions.availableDimensions.push(new Dimension('patient'));
    dimensions.availableDimensions.push(new Dimension('study'));
    const dimensionsSpy = spyOn(transmartResourceService, 'getDimensions').and.returnValue(observableOf(dimensions));
    const exportSpy = spyOn(transmartHttpService, 'runExportJob').and.callFake(() => {
      return observableOf(null);
    });
    transmartResourceService.exportDataView = 'dataTable';
    const table = new DataTable();
    const dataType = new ExportDataType('clinical', true);
    dataType.fileFormats.push(new ExportFileFormat('TSV', true));
    transmartResourceService.runExportJob(jobId, jobName, mockConstraint, [dataType], table, false)
      .subscribe(() => {
        expect(dimensionsSpy).toHaveBeenCalled();
        expect(exportSpy).toHaveBeenCalled();
        done();
      });
  });

  it('should run transmart export job without data table view', (done) => {
    transmartResourceService.useExternalExportJob = false;

    // with auto saved subject set, no table state
    const jobId = 'foo';
    const jobName = 'bar';
    transmartResourceService.autosaveSubjectSets = false;
    const mockConstraint = new ConceptConstraint();
    mockConstraint.concept = new Concept();

    const dimensionsSpy = spyOn(transmartResourceService, 'getDimensions').and.returnValue(observableOf(null));
    const exportSpy = spyOn(transmartHttpService, 'runExportJob').and.callFake(() => {
      return observableOf(null);
    });
    transmartResourceService.exportDataView = 'dataTable';
    const table = new DataTable();
    const dataType = new ExportDataType('mrna', true);
    dataType.fileFormats.push(new ExportFileFormat('TSV', true));
    transmartResourceService.runExportJob(jobId, jobName, mockConstraint, [dataType], table, false)
      .subscribe(() => {
        expect(dimensionsSpy).not.toHaveBeenCalled();
        expect(exportSpy).toHaveBeenCalled();
        done();
      });
  });

  it('should run external export job', () => {
    transmartResourceService.useExternalExportJob = true;
    let jobId = 'foo';
    const jobName = 'custom_name';
    let mockConstraint = new TrueConstraint();
    let exportSpy = spyOn(transmartPackerHttpService, 'runJob').and.callFake(() => {
      return observableOf(null);
    });
    transmartResourceService.runExportJob(jobId, jobName, mockConstraint, [], null, false);
    expect(exportSpy).toHaveBeenCalledWith(jobName, mockConstraint);
  });
});
