import {inject, TestBed} from '@angular/core/testing';
import {of as observableOf} from 'rxjs';

import {TransmartResourceService} from './transmart-resource.service';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock} from '../../config/app.config.mock';
import {TransmartTableState} from '../../models/transmart-models/transmart-table-state';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {Concept} from '../../models/constraint-models/concept';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {TransmartHttpService} from './transmart-http.service';
import {TransmartHttpServiceMock} from '../mocks/transmart-http.service.mock';
import {TransmartPackerHttpService} from './transmart-packer-http.service';
import {TransmartPackerHttpServiceMock} from '../mocks/transmart-packer-http.service.mock';
import {DataTable} from '../../models/table-models/data-table';

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

  it('should be injected', inject([TransmartResourceService], (service: TransmartResourceService) => {
    expect(service).toBeTruthy();
  }));

  it('should run transmart export job', () => {
    transmartResourceService.useExternalExportJob = false;

    // scenario 1: with auto saved subject set, no table state
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
    transmartResourceService.runExportJob(jobId, jobName, mockConstraint, [], false, table).subscribe((res) => {
      expect(res['foo']).toBe('bar');
    });
    spyOn(transmartHttpService, 'runExportJob').and.callFake(() => {
      return observableOf([]);
    });

    // scenario 2: with auto saved subject set, with table state
    // let tableState = new TransmartTableState(['row1'], []);
    // transmartResourceService.runExportJob(jobId, mockConstraint, elements, tableState).subscribe((res) => {
    //   expect(res['foo']).toBe('bar');
    // });
    // expect(req.request.body['tableConfig']).toBeDefined();
    // expect(req.request.body['tableConfig']['rowDimensions'][0]).toBe('row1');

  });

  // it('should run external export job',
  //   inject([HttpTestingController, TransmartResourceService],
  //     (service: TransmartResourceService) => {
  //       service.useExternalExportJob = true;
  //       // scenario 1: no auto saved subject set
  //       const jobName = 'custom_name';
  //       let mockConstraint = new TrueConstraint();
  //       service.runExportJob('', jobName, mockConstraint, [], false,  null).subscribe((res) => {
  //         expect(res['foo']).toBe('bar');
  //       });
  //       const url = service.endpointUrl + '/jobs/create';
  //       let req = httpMock.expectOne(url);
  //       expect(req.request.method).toEqual('POST');
  //       expect(req.request.body['job_parameters']).toBeDefined();
  //       expect(req.request.body['job_parameters']['constraint']).toBeDefined();
  //       expect(req.request.body['job_parameters']['constraint']['type']).toBe('true');
  //       expect(req.request.body['job_parameters']['custom_name']).toBe('custom_name');
  //
  //       // scenario 2: with auto saved subject set
  //       service.autosaveSubjectSets = true;
  //       service.subjectSetConstraint = new SubjectSetConstraint();
  //       service.subjectSetConstraint.subjectIds = ['id1', 'id2'];
  //       mockConstraint = new CombinationConstraint();
  //       let c1 = new ConceptConstraint();
  //       c1.concept = new Concept();
  //       let c2 = new ConceptConstraint();
  //       c2.concept = new Concept();
  //       (<CombinationConstraint>mockConstraint).addChild(c1);
  //       (<CombinationConstraint>mockConstraint).addChild(c2);
  //       service.runJob(jobName, mockConstraint).subscribe((res) => {
  //         expect(res['foo']).toBe('bar');
  //       });
  //       req = httpMock.expectOne(url);
  //       expect(req.request.body['job_parameters']['constraint']['type']).toBe('and');
  //
  //       console.log(req.request.body['job_parameters']['constraint'])
  //     }));
});
