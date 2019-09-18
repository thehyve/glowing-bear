import {inject, TestBed} from '@angular/core/testing';
import {of as observableOf} from 'rxjs';
import {TransmartResourceService} from './transmart-resource.service';
import {AppConfig} from '../config/app.config';
import {AppConfigMock} from '../config/app.config.mock';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {Concept} from '../models/constraint-models/concept';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {SubjectSetConstraint} from '../models/constraint-models/subject-set-constraint';
import {TransmartHttpService} from './http/transmart-http.service';
import {TransmartHttpServiceMock} from './mocks/transmart-http.service.mock';
import {TransmartPackerHttpService} from './http/transmart-packer-http.service';
import {TransmartPackerHttpServiceMock} from './mocks/transmart-packer-http.service.mock';
import {DataTable} from '../models/table-models/data-table';
import {TrueConstraint} from '../models/constraint-models/true-constraint';
import {TransmartStudyDimensions} from '../models/transmart-models/transmart-study-dimensions';
import {TableDimension} from '../models/table-models/table-dimension';
import {ExportDataType} from '../models/export-models/export-data-type';
import {ExportFileFormat} from '../models/export-models/export-file-format';
import {SubjectSet} from '../models/constraint-models/subject-set';
import {TransmartCountItem} from '../models/transmart-models/transmart-count-item';
import {TransmartDimension} from '../models/transmart-models/transmart-dimension';
import {ServerStatus} from '../models/server-status';

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

  it('should check server status (up)', (done) => {
    transmartResourceService.status.subscribe(status => {
      expect(status).toEqual(ServerStatus.UP);
      done();
    });
    transmartResourceService.init();
  });

  it('should check server status (down)', (done) => {
    (<TransmartHttpServiceMock><unknown>transmartHttpService).serverStatus = 'down';
    transmartResourceService.status.subscribe(status => {
      expect(status).toEqual(ServerStatus.DOWN);
      done();
    });
    transmartResourceService.init();
  });

  it('should check server status (error)', (done) => {
    (<TransmartHttpServiceMock><unknown>transmartHttpService).serverStatus = new Error('Could not connect');
    transmartResourceService.status.subscribe(status => {
      expect(status).toEqual(ServerStatus.ERROR);
      done();
    });
    transmartResourceService.init();
  });

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
    transmartResourceService.runExportJob(jobId, jobName, mockConstraint, mockConstraint,
      [dataType], null, false);
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
    table.rowDimensions = [new TableDimension('patient')];
    table.columnDimensions = [new TableDimension(('concept'))];
    const dataType = new ExportDataType('clinical', true);
    dataType.fileFormats.push(new ExportFileFormat('TSV', true));
    transmartResourceService.runExportJob(jobId, jobName, mockConstraint, mockConstraint,
      [dataType], table, false);
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
    dimensions.availableDimensions.push(new TableDimension('patient'));
    dimensions.availableDimensions.push(new TableDimension('study'));
    const dimensionsSpy = spyOn(transmartResourceService, 'getDimensions').and.returnValue(observableOf(dimensions));
    const exportSpy = spyOn(transmartHttpService, 'runExportJob').and.callFake(() => {
      return observableOf(null);
    });
    transmartResourceService.exportDataView = 'dataTable';
    const table = new DataTable();
    const dataType = new ExportDataType('clinical', true);
    dataType.fileFormats.push(new ExportFileFormat('TSV', true));
    transmartResourceService.runExportJob(jobId, jobName, mockConstraint, mockConstraint,
      [dataType], table, false)
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
    transmartResourceService.runExportJob(jobId, jobName, mockConstraint, mockConstraint,
      [dataType], table, false)
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

    transmartResourceService.runExportJob(jobId, jobName, mockConstraint, mockConstraint,
      [], null, false);
    expect(exportSpy).toHaveBeenCalledWith(jobName, jasmine.any(CombinationConstraint), mockConstraint);
  });

  const createMockConstraints = () => {
    const constraint1 = new ConceptConstraint();
    constraint1.concept = new Concept();
    constraint1.concept.code = 'Foo';
    const constraint2 = new ConceptConstraint();
    constraint2.concept = new Concept();
    constraint2.concept.code = 'Bar';

    const constraintWithoutNegation = new CombinationConstraint();
    constraintWithoutNegation.addChild(constraint1);
    constraintWithoutNegation.addChild(constraint2);

    const constraintWithNegation = new CombinationConstraint();
    constraint2.negated = true;
    constraintWithoutNegation.addChild(constraint1);
    constraintWithoutNegation.addChild(constraint2);
    return {
      constraintWithoutNegation: constraintWithoutNegation,
      constraintWithNegation: constraintWithNegation,
    }
  };

  it('should compute counts for a query without negated constraint', (done) => {
    const constraints = createMockConstraints();
    transmartResourceService.autosaveSubjectSets = false;
    transmartResourceService.updateCohortSelectionCounts(constraints.constraintWithoutNegation)
      .then((response) => {
        expect(response).toBe(true);
        expect(transmartResourceService.counts.patientCount).toEqual(100);
        expect(transmartResourceService.counts.observationCount).toEqual(1000);
        done();
      })
  });

  it('should compute counts for a query', (done) => {
    const constraints = createMockConstraints();
    transmartResourceService.autosaveSubjectSets = false;
    spyOn(transmartHttpService, 'getCounts').and.callFake((constraint) => {
      const result = new TransmartCountItem();
      result.patientCount = 400;
      result.observationCount = 4000;

      return observableOf(result);
    });

    transmartResourceService.updateCohortSelectionCounts(constraints.constraintWithNegation)
      .then((response) => {
        expect(response).toBe(true);
        expect(transmartResourceService.counts.patientCount).toEqual(400);
        expect(transmartResourceService.counts.observationCount).toEqual(4000);
        done();
      })
  });

  it('should compute counts for a query with autosave subjects setting', (done) => {
    transmartResourceService.autosaveSubjectSets = true;
    const constraints = createMockConstraints();
    spyOn(transmartHttpService, 'savePatientSet').and.callFake((name, constraint) => {
      const result = new SubjectSet();
      switch (constraint) {
        case constraints.constraintWithoutNegation:
          // selected subjects: included subjects minus excluded subjects
          result.id = 123;
          result.setSize = 250;
          break;
        case constraints.constraintWithNegation:
          // intersection between included subjects and excluded subjects
          result.id = 789;
          result.setSize = 150;
          break;
        default:
          throw new Error('Unexpected query');
      }
      return observableOf(result);
    });

    transmartResourceService.updateCohortSelectionCounts(constraints.constraintWithNegation)
      .then((response) => {
        expect(response).toBe(true);
        // number of subjects
        expect(transmartResourceService.counts.patientCount).toEqual(150);
        expect(transmartResourceService.counts.observationCount).toEqual(700);
        done();
      })
      .catch((error) => {
        console.error('Unexpected error', error);
        fail('Unexpected error');
        done();
      })
  });

  it('should get subject dimensions', (done) => {
    transmartResourceService.getSubjectDimensions()
      .subscribe((res: TransmartDimension[]) => {
        let resultNames = res.map(r => r.name);
        expect(res.length).toBe(2);
        expect(resultNames).toContain('td2');
        expect(resultNames).toContain('td4');
        done();
      });
  });

});
