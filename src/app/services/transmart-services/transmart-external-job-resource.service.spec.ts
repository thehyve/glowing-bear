/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {inject, TestBed} from '@angular/core/testing';
import {HttpClientModule} from '@angular/common/http';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock} from '../../config/app.config.mock';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {Concept} from '../../models/constraint-models/concept';
import {TransmartExternalJobResourceService} from './transmart-external-job-resource.service';
import {ExportDataType} from '../../models/export-models/export-data-type';

describe('TransmartExternalJobResourceService', () => {

  let transmartExternalJobResourceService: TransmartExternalJobResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule
      ],
      providers: [
        TransmartExternalJobResourceService,
        {
          provide: AppConfig,
          useClass: AppConfigMock
        }
      ]
    });
    transmartExternalJobResourceService = TestBed.get(TransmartExternalJobResourceService);
  });

  afterEach(inject([HttpTestingController], (httpMock: HttpTestingController) => {
    httpMock.verify();
  }));

  it('should be injected',
    inject([TransmartExternalJobResourceService], (service: TransmartExternalJobResourceService) => {
      expect(service).toBeTruthy();
    }));

  it('should get export jobs',
    inject([HttpTestingController, TransmartExternalJobResourceService],
      (httpMock: HttpTestingController, service: TransmartExternalJobResourceService) => {
        const mockData = {
          jobs: {
            foo: 'bar'
          }
        };
        service.getAllJobs().subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/jobs';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('GET');
        req.flush(mockData);
      }));

  it('should get export data types',
    inject([HttpTestingController, TransmartExternalJobResourceService],
      (httpMock: HttpTestingController, service: TransmartExternalJobResourceService) => {
        service.getExportDataTypes().subscribe((res: ExportDataType[]) => {
          expect(res.length).toBe(1);
          expect(res[0].name).toBe('clinical');
          expect(res[0].fileFormats.length).toBe(1);
          expect(res[0].fileFormats[0].name).toBe('TSV');
        });
      }));

  it('should download export job data',
    inject([HttpTestingController, TransmartExternalJobResourceService],
      (httpMock: HttpTestingController, service: TransmartExternalJobResourceService) => {
        const jobId = 'anid';
        const mockData: Blob = new Blob([]);
        service.downloadJobData(jobId).subscribe(res => {
          expect(res).toBe(mockData);
        });
        const url = service.endpointUrl + '/jobs/data/' + jobId;
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('GET');
        expect(req.request.responseType).toEqual('blob');
        req.flush(mockData);
      }));

  it('should cancel export job',
    inject([HttpTestingController, TransmartExternalJobResourceService],
      (httpMock: HttpTestingController, service: TransmartExternalJobResourceService) => {
        const mockData = {
          exportJob: {
            foo: 'bar'
          }
        };
        const jobId = 'an-id';
        service.cancelJob(jobId).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/jobs/cancel/' + jobId;
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('POST');
        req.flush(mockData);
      }));

  it('should run export job',
    inject([HttpTestingController, TransmartExternalJobResourceService],
      (httpMock: HttpTestingController, service: TransmartExternalJobResourceService) => {
        // scenario 1: no auto saved subject set
        const jobId = 'an-id';
        let mockConstraint = new TrueConstraint();
        service.runJob(jobId, mockConstraint).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/jobs/create';
        let req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body['job_parameters']).toBeDefined();
        expect(req.request.body['job_parameters']['constraint']).toBeDefined();
        expect(req.request.body['job_parameters']['constraint']['type']).toBe('true');

        // scenario 2: with auto saved subject set
        service.autosaveSubjectSets = true;
        service.subjectSetConstraint = new SubjectSetConstraint();
        service.subjectSetConstraint.subjectIds = ['id1', 'id2'];
        mockConstraint = new CombinationConstraint();
        let c1 = new ConceptConstraint();
        c1.concept = new Concept();
        let c2 = new ConceptConstraint();
        c2.concept = new Concept();
        (<CombinationConstraint>mockConstraint).addChild(c1);
        (<CombinationConstraint>mockConstraint).addChild(c2);
        service.runJob(jobId, mockConstraint).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        req = httpMock.expectOne(url);
        expect(req.request.body['job_parameters']['constraint']['type']).toBe('and');

        console.log(req.request.body['job_parameters']['constraint'])
      }));

});