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
import {Constraint} from '../../models/constraint-models/constraint';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';

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

  it('should run transmart export job', () => {
    transmartResourceService.useExternalExportJob = false;

    // with auto saved subject set, no table state
    let jobId = 'foo';
    let jobName = 'bar';
    let table: DataTable = null;
    transmartResourceService.autosaveSubjectSets = true;
    transmartResourceService.subjectSetConstraint = new SubjectSetConstraint();
    transmartResourceService.subjectSetConstraint.subjectIds = ['id1', 'id2'];
    let mockConstraint = new CombinationConstraint();
    let c1 = new ConceptConstraint();
    c1.concept = new Concept();
    let c2 = new ConceptConstraint();
    c2.concept = new Concept();
    (<CombinationConstraint>mockConstraint).addChild(c1);
    (<CombinationConstraint>mockConstraint).addChild(c2);
    let exportSurveyTableSpy = spyOn(transmartHttpService, 'runSurveyTableExportJob').and.callFake(() => {
      return observableOf(null);
    });
    transmartResourceService.exportDataView = 'surveyTable';
    transmartResourceService.runExportJob(jobId, jobName, mockConstraint, [], table, false);
    expect(exportSurveyTableSpy).toHaveBeenCalled();

    let exportSpy = spyOn(transmartHttpService, 'runExportJob').and.callFake(() => {
      return observableOf(null);
    });
    transmartResourceService.exportDataView = 'dataTable';
    transmartResourceService.runExportJob(jobId, jobName, mockConstraint, [], table, false);
    expect(exportSpy).toHaveBeenCalled();
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
