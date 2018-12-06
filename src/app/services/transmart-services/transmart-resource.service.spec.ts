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
import {NegationConstraint} from '../../models/constraint-models/negation-constraint';
import {SubjectSet} from '../../models/constraint-models/subject-set';
import {TransmartCountItem} from '../../models/transmart-models/transmart-count-item';

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

  const createMockConstraints = () => {
    const inclusionConstraint = new ConceptConstraint();
    inclusionConstraint.concept = new Concept();
    inclusionConstraint.concept.code = 'Foo';
    const exclusionConstraint = new ConceptConstraint();
    exclusionConstraint.concept = new Concept();
    exclusionConstraint.concept.code = 'Bar';
    const excludedConstraint = new CombinationConstraint();
    excludedConstraint.addChild(inclusionConstraint);
    excludedConstraint.addChild(exclusionConstraint);
    const constraint = new CombinationConstraint();
    constraint.addChild(inclusionConstraint);
    constraint.addChild(new NegationConstraint(exclusionConstraint));
    return {
      inclusionConstraint: inclusionConstraint,
      excludedConstraint: excludedConstraint,
      constraint: constraint
    }
  };

  it('should compute counts for a query without exclusion constraint', (done) => {
    const constraints = createMockConstraints();
    transmartResourceService.autosaveSubjectSets = false;
    transmartResourceService.updateInclusionExclusionCounts(
      constraints.inclusionConstraint, constraints.inclusionConstraint, null)
      .then((response) => {
        expect(response).toBe(true);
        expect(transmartResourceService.inclusionCounts.patientCount).toEqual(100);
        expect(transmartResourceService.inclusionCounts.observationCount).toEqual(1000);
        expect(transmartResourceService.exclusionCounts.patientCount).toEqual(0);
        expect(transmartResourceService.exclusionCounts.observationCount).toEqual(0);
        done();
      })
  });

  it('should compute counts for a query', (done) => {
    const constraints = createMockConstraints();
    transmartResourceService.autosaveSubjectSets = false;
    spyOn(transmartHttpService, 'getCounts').and.callFake((constraint) => {
      const result = new TransmartCountItem();
      switch (constraint) {
        case constraints.inclusionConstraint:
          result.patientCount = 400;
          result.observationCount = 4000;
          break;
        case constraints.excludedConstraint:
          result.patientCount = 150;
          result.observationCount = 1500;
          break;
        default:
          throw Error('Unexpected query');
      }
      return observableOf(result);
    });

    transmartResourceService.updateInclusionExclusionCounts(
      constraints.constraint, constraints.inclusionConstraint, constraints.excludedConstraint)
      .then((response) => {
        expect(response).toBe(true);
        expect(transmartResourceService.inclusionCounts.patientCount).toEqual(400);
        expect(transmartResourceService.inclusionCounts.observationCount).toEqual(4000);
        expect(transmartResourceService.exclusionCounts.patientCount).toEqual(150);
        expect(transmartResourceService.exclusionCounts.observationCount).toEqual(1500);
        done();
      })
  });

  it('should compute counts for a query with autosave subjects setting', (done) => {
    transmartResourceService.autosaveSubjectSets = true;
    const constraints = createMockConstraints();
    spyOn(transmartHttpService, 'savePatientSet').and.callFake((name, constraint) => {
      const result = new SubjectSet();
      switch (constraint) {
        case constraints.constraint:
          // selected subjects: included subjects minus excluded subjects
          result.id = 123;
          result.setSize = 250;
          break;
        case constraints.excludedConstraint:
          // intersection between included subjects and excluded subjects
          result.id = 789;
          result.setSize = 150;
          break;
        default:
          throw new Error('Unexpected query');
      }
      return observableOf(result);
    });

    transmartResourceService.updateInclusionExclusionCounts(
      constraints.constraint, constraints.inclusionConstraint, constraints.excludedConstraint)
      .then((response) => {
        expect(response).toBe(true);
        // included subjects (including excluded subjects)
        expect(transmartResourceService.inclusionCounts.patientCount).toEqual(400);
        expect(transmartResourceService.inclusionCounts.observationCount).toEqual(-1);
        // number of subjects excluded from the set of included subjects
        expect(transmartResourceService.exclusionCounts.patientCount).toEqual(150);
        expect(transmartResourceService.exclusionCounts.observationCount).toEqual(-1);
        done();
      })
      .catch((error) => {
        console.error('Unexpected error', error);
        fail('Unexpected error');
        done();
      })
  });

});
