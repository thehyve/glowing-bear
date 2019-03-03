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
import {AppConfigPackerMock} from '../../config/app.config.mock';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {TransmartPackerHttpService} from './transmart-packer-http.service';
import {ExportDataType} from '../../models/export-models/export-data-type';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {Concept} from '../../models/constraint-models/concept';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {ConstraintMark} from '../../models/constraint-models/constraint-mark';

describe('TransmartPackerHttpService', () => {

  let transmartPackerHttpService: TransmartPackerHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule
      ],
      providers: [
        TransmartPackerHttpService,
        {
          provide: AppConfig,
          useClass: AppConfigPackerMock
        }
      ]
    });
    transmartPackerHttpService = TestBed.get(TransmartPackerHttpService);
  });

  afterEach(inject([HttpTestingController], (httpMock: HttpTestingController) => {
    httpMock.verify();
  }));

  it('should be injected',
    inject([TransmartPackerHttpService], (service: TransmartPackerHttpService) => {
      expect(service).toBeTruthy();
    }));

  it('should get export jobs',
    inject([HttpTestingController, TransmartPackerHttpService],
      (httpMock: HttpTestingController, service: TransmartPackerHttpService) => {
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
    inject([HttpTestingController, TransmartPackerHttpService],
      (httpMock: HttpTestingController, service: TransmartPackerHttpService) => {
        service.getExportDataTypes().subscribe((res: ExportDataType[]) => {
          expect(res.length).toBe(1);
          expect(res[0].name).toBe('clinical');
          expect(res[0].fileFormats.length).toBe(1);
          expect(res[0].fileFormats[0].name).toBe('TSV');
        });
      }));

  it('should download export job data',
    inject([HttpTestingController, TransmartPackerHttpService],
      (httpMock: HttpTestingController, service: TransmartPackerHttpService) => {
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
    inject([HttpTestingController, TransmartPackerHttpService],
      (httpMock: HttpTestingController, service: TransmartPackerHttpService) => {
        const mockData = {
          exportJob: {
            foo: 'bar'
          }
        };
        const jobId = 'an-id';
        service.cancelJob(jobId).subscribe((res) => {
          expect(res).toBe(mockData);
        });
        const url = service.endpointUrl + '/jobs/cancel/' + jobId;
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('GET');
        req.flush(mockData);
      }));

  it('should run external export job',
    inject([HttpTestingController, TransmartPackerHttpService],
      (httpMock: HttpTestingController, service: TransmartPackerHttpService) => {
        const jobName = 'custom_name';
        let mockConstraint = new TrueConstraint();
        service.runJob(jobName, mockConstraint).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/jobs/create';
        let req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body['job_parameters']).toBeDefined();
        expect(req.request.body['job_parameters']['constraint']).toBeDefined();
        expect(req.request.body['job_parameters']['constraint']['type']).toBe('true');
        expect(req.request.body['job_parameters']['custom_name']).toBe('custom_name');
        expect(req.request.body['job_parameters']['custom_name']).toBe('custom_name');
      }));

  it('should not include row_filter when running export job',
    inject([HttpTestingController, TransmartPackerHttpService],
      (httpMock: HttpTestingController, service: TransmartPackerHttpService) => {
        const jobName = 'custom_name';
        const c1 = new ConceptConstraint();
        c1.concept = new Concept();
        const mockConstraint = new CombinationConstraint();
        mockConstraint.addChild(c1);
        mockConstraint.dimension = 'patient';
        service.runJob(jobName, mockConstraint).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/jobs/create';
        let req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body['job_parameters']).toBeDefined();
        expect(req.request.body['job_parameters']['constraint']).toBeDefined();
        expect(req.request.body['job_parameters']['row_filter']).not.toBeDefined();
      }));

  it('should include row_filter when running export job',
    inject([HttpTestingController, TransmartPackerHttpService],
      (httpMock: HttpTestingController, service: TransmartPackerHttpService) => {
        const jobName = 'custom_name';
        const c1 = new ConceptConstraint();
        c1.concept = new Concept();
        c1.dimension = 'Biosource ID';
        const mockConstraint = new CombinationConstraint();
        mockConstraint.mark = ConstraintMark.SUBJECT;
        mockConstraint.dimension = 'Biosource ID';
        mockConstraint.addChild(c1);
        service.runJob(jobName, mockConstraint).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/jobs/create';
        let req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body['job_parameters']).toBeDefined();
        expect(req.request.body['job_parameters']['constraint']).toBeDefined();
        expect(req.request.body['job_parameters']['constraint']).toEqual({
            type: 'subselection',
            dimension: 'patient',
            constraint: {
              type: 'subselection',
              dimension: 'Biosource ID',
              constraint: {
                type: 'concept',
                conceptCode: undefined
            }
          }
        });
        expect(req.request.body['job_parameters']['row_filter']).toBeDefined();
        expect(req.request.body['job_parameters']['row_filter']).toEqual({
            type: 'subselection',
            dimension: 'Biosource ID',
            constraint: {
              type: 'concept',
              conceptCode: undefined
          }
        });
      }));

});
