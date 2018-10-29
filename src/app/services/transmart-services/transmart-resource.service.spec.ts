import { TestBed } from '@angular/core/testing';

import { TransmartResourceService } from './transmart-resource.service';
import {HttpService} from '../http-service';
import {HttpClientModule} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock} from '../../config/app.config.mock';
import {TransmartTableState} from '../../models/transmart-models/transmart-table-state';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {Concept} from '../../models/constraint-models/concept';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {TransmartExportElement} from '../../models/transmart-models/transmart-export-element';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {inject} from '@angular/core';
import {Study} from '../../models/constraint-models/study';
import {TransmartHttpService} from './transmart-http.service';
import {TransmartHttpServiceMock} from '../mocks/transmart-http.service.mock';
import {TransmartExternalJobResourceService} from './transmart-external-job-resource.service';
import {TransmartExternalJobResourceServiceMock} from '../mocks/transmart-external-job-resource.service.mock';

describe('TransmartResourceService', () => {

  let transmartResourceService: TransmartResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
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
          provide: TransmartExternalJobResourceService,
          useClass: TransmartExternalJobResourceServiceMock
        },
      ]
    });
    transmartResourceService = TestBed.get(TransmartResourceService);
  });

  it('should be created', () => {
    const service: TransmartResourceService = TestBed.get(TransmartResourceService);
    expect(service).toBeTruthy();
  });

  // it('should run transmart export job',
  //   inject([TransmartResourceService],
  //     (httpMock: HttpTestingController, service: TransmartResourceService) => {
  //       service.useExternalExportJob = false;
  //       // scenario 1: no auto saved subject set, no table state
  //       const jobId = 'an-id';
  //       const mockData = {
  //         exportJob: {
  //           foo: 'bar'
  //         }
  //       };
  //       let mockConstraint = new TrueConstraint();
  //       const el1 = new TransmartExportElement();
  //       const el2 = new TransmartExportElement();
  //       const elements = [el1, el2];
  //       let tableState = undefined;
  //       service.runExportJob(jobId, mockConstraint, elements, tableState).subscribe((res) => {
  //         expect(res['foo']).toBe('bar');
  //       });
  //       const url = service.endpointUrl + '/export/' + jobId + '/run';
  //       let req = httpMock.expectOne(url);
  //       expect(req.request.method).toEqual('POST');
  //       expect(req.request.body['constraint']).toBeDefined();
  //       expect(req.request.body['constraint']['type']).toBe('true');
  //       expect(req.request.body['elements']).toBeDefined();
  //       expect(req.request.body['includeMeasurementDateColumns']).toBeDefined();
  //
  //       // scenario 2: with auto saved subject set, no table state
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
  //       service.runExportJob(jobId, mockConstraint, elements, tableState).subscribe((res) => {
  //         expect(res['foo']).toBe('bar');
  //       });
  //       req = httpMock.expectOne(url);
  //       expect(req.request.body['constraint']['type']).toBe('and');
  //
  //       // scenario 2: with auto saved subject set, with table state
  //       tableState = new TransmartTableState(['row1'], []);
  //       service.runExportJob(jobId, mockConstraint, elements, tableState).subscribe((res) => {
  //         expect(res['foo']).toBe('bar');
  //       });
  //       req = httpMock.expectOne(url);
  //       expect(req.request.body['tableConfig']).toBeDefined();
  //       expect(req.request.body['tableConfig']['rowDimensions'][0]).toBe('row1');
  //
  //       console.log(req.request.body['constraint'])
  //     }));
  //
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
