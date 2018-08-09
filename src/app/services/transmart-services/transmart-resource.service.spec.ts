/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed, inject} from '@angular/core/testing';

import {TransmartResourceService} from './transmart-resource.service';
import {HttpClientModule, HttpErrorResponse} from '@angular/common/http';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock} from '../../config/app.config.mock';
import {MessageHelper} from '../../utilities/message-helper';
import {Observable} from 'rxjs/Observable';
import {TransmartStudy} from '../../models/transmart-models/transmart-study';
import {QueryService} from '../query.service';
import {QueryServiceMock} from '../mocks/query.service.mock';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {Pedigree} from '../../models/constraint-models/pedigree';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';

describe('TransmartResourceService', () => {

  let transmartResourceService: TransmartResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule
      ],
      providers: [
        TransmartResourceService,
        {
          provide: AppConfig,
          useClass: AppConfigMock
        }
      ]
    });
    transmartResourceService = TestBed.get(TransmartResourceService);
  });

  afterEach(inject([HttpTestingController], (httpMock: HttpTestingController) => {
    httpMock.verify();
  }));

  it('should be injected',
    inject([TransmartResourceService], (service: TransmartResourceService) => {
      expect(service).toBeTruthy();
    }));

  it('should get tree nodes',
    inject([HttpTestingController, TransmartResourceService],
      (httpMock: HttpTestingController, service: TransmartResourceService) => {
        const mockData = {
          tree_nodes: {
            foo: 'bar'
          }
        };
        service.getTreeNodes('root', 2, false, false).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/tree_nodes?root=root&depth=2';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('GET');
        req.flush(mockData);
      }));

  it('should get pedigrees',
    inject([HttpTestingController, TransmartResourceService],
      (httpMock: HttpTestingController, service: TransmartResourceService) => {
        const mockData = {
          relationTypes: {
            foo: 'bar'
          }
        };
        service.getPedigrees().subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/pedigree/relation_types';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('GET');
        req.flush(mockData);
      }));

  it('should get export jobs',
    inject([HttpTestingController, TransmartResourceService],
      (httpMock: HttpTestingController, service: TransmartResourceService) => {
        const mockData = {
          exportJobs: {
            foo: 'bar'
          }
        };
        service.getExportJobs().subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/export/jobs';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('GET');
        req.flush(mockData);
      }));

  it('should get export data formats',
    inject([HttpTestingController, TransmartResourceService],
      (httpMock: HttpTestingController, service: TransmartResourceService) => {
        const mockData = {
          dataFormats: {
            foo: 'bar'
          }
        };
        const mockConstraint = new TrueConstraint();
        service.getExportDataFormats(mockConstraint).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/export/data_formats';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('POST');
        req.flush(mockData);
      }));

  it('should get export file formats',
    inject([HttpTestingController, TransmartResourceService],
      (httpMock: HttpTestingController, service: TransmartResourceService) => {
        const mockData = {
          fileFormats: {
            foo: 'bar'
          }
        };
        service.getExportFileFormats().subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/export/file_formats?dataView=default';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('GET');
        req.flush(mockData);
      }));

  it('should get trial visits',
    inject([HttpTestingController, TransmartResourceService],
      (httpMock: HttpTestingController, service: TransmartResourceService) => {
        const mockData = {
          elements: {
            foo: 'bar'
          }
        };
        const mockConstraint = new TrueConstraint();
        service.getTrialVisits(mockConstraint).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/dimensions/trial visit/elements?constraint={"type":"true"}';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('GET');
        req.flush(mockData);
      }));


  it('should get aggregate',
    inject([HttpTestingController, TransmartResourceService],
      (httpMock: HttpTestingController, service: TransmartResourceService) => {
        const mockData = {
          aggregatesPerConcept: {
            foo: 'bar'
          }
        };
        const mockConstraint = new TrueConstraint();
        service.getAggregate(mockConstraint).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/observations/aggregates_per_concept';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('POST');
        req.flush(mockData);
      }));

  it('should get counts',
    inject([HttpTestingController, TransmartResourceService],
      (httpMock: HttpTestingController, service: TransmartResourceService) => {
        const mockData = {
          foo: 'bar'
        };
        const mockConstraint = new TrueConstraint();
        service.getCounts(mockConstraint).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/observations/counts';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('POST');
        req.flush(mockData);
      }));

  it('should get counts per concept',
    inject([HttpTestingController, TransmartResourceService],
      (httpMock: HttpTestingController, service: TransmartResourceService) => {
        const mockData = {
          countsPerConcept: {
            foo: 'bar'
          }
        };
        const mockConstraint = new TrueConstraint();
        service.getCountsPerConcept(mockConstraint).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/observations/counts_per_concept';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('POST');
        req.flush(mockData);
      }));

  it('should get counts per study',
    inject([HttpTestingController, TransmartResourceService],
      (httpMock: HttpTestingController, service: TransmartResourceService) => {
        const mockData = {
          countsPerStudy: {
            foo: 'bar'
          }
        };
        const mockConstraint = new TrueConstraint();
        service.getCountsPerStudy(mockConstraint).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/observations/counts_per_study';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('POST');
        req.flush(mockData);
      }));

  it('should get counts per study and concept',
    inject([HttpTestingController, TransmartResourceService],
      (httpMock: HttpTestingController, service: TransmartResourceService) => {
        const mockData = {
          countsPerStudy: {
            foo: 'bar'
          }
        };
        const mockConstraint = new TrueConstraint();
        service.getCountsPerStudyAndConcept(mockConstraint).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/observations/counts_per_study_and_concept';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('POST');
        req.flush(mockData);
      }));

  it('should fetch studies from the TranSMART resource service', function () {
    let study1 = new TransmartStudy();
    study1.studyId = 'TestStudy1';
    study1.dimensions = ['patient', 'concept', 'start time'];
    let study2 = new TransmartStudy();
    study2.studyId = 'TestStudy2';
    study2.dimensions = ['patient', 'concept', 'trial visit', 'sample_type'];
    let testStudies: TransmartStudy[] = [study1, study2];

    let resourceCall = spyOn(transmartResourceService, 'getStudies').and.callFake(() =>
      Observable.of(testStudies)
    );

    // The first time, the studies should be fetched from the resource
    transmartResourceService.studies.then(studies1 => {
      expect(studies1).toEqual(testStudies);
      expect(resourceCall).toHaveBeenCalledTimes(1);
      // The second time, the studies should already be available
      transmartResourceService.studies.then(studies2 => {
        expect(studies2).toEqual(testStudies);
        expect(resourceCall).toHaveBeenCalledTimes(1);
      });
    }).catch(() =>
      fail()
    );
  });

  it('should notify the user when studies cannot be fetched', function () {
    spyOn(transmartResourceService, 'getStudies').and.callFake(() =>
      Observable.fromPromise(new Promise(() => {
        throw new HttpErrorResponse({status: 500});
      }))
    );

    let messageCount = MessageHelper.messages.length;
    // The first time, the studies should be fetched from the resource
    transmartResourceService.studies.then(() =>
      fail()
    ).catch(() => {
      expect(MessageHelper.messages.length).toEqual(messageCount);
      expect(MessageHelper.messages[messageCount].summary).toContain('A server-side error occurred');
    });
  });

});
