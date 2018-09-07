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
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {TransmartExportElement} from '../../models/transmart-models/transmart-export-element';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {Concept} from '../../models/constraint-models/concept';
import {TransmartTableState} from '../../models/transmart-models/transmart-table-state';
import {of as observableOf} from 'rxjs';

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

  it('should download export job',
    inject([HttpTestingController, TransmartResourceService],
      (httpMock: HttpTestingController, service: TransmartResourceService) => {
        const jobId = 'anid';
        const mockData: Blob = new Blob([]);
        service.downloadExportJob(jobId).subscribe(res => {
          expect(res).toBe(mockData);
        })
        const url = service.endpointUrl + '/export/' + jobId + '/download';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('GET');
        expect(req.request.responseType).toEqual('blob');
        req.flush(mockData);
      }));

  it('should cancel export job',
    inject([HttpTestingController, TransmartResourceService],
      (httpMock: HttpTestingController, service: TransmartResourceService) => {
        const mockData = {
          exportJob: {
            foo: 'bar'
          }
        };
        const jobId = 'an-id';
        service.cancelExportJob(jobId).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/export/' + jobId + '/cancel';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('POST');
        req.flush(mockData);
      }));

  it('should archive export job',
    inject([HttpTestingController, TransmartResourceService],
      (httpMock: HttpTestingController, service: TransmartResourceService) => {
        const mockData = {
          foo: 'bar'
        };
        const jobId = 'an-id';
        service.archiveExportJob(jobId).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/export/' + jobId;
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('DELETE');
        req.flush(mockData);
      }));

  it('should run export job',
    inject([HttpTestingController, TransmartResourceService],
      (httpMock: HttpTestingController, service: TransmartResourceService) => {
        // scenario 1: no auto saved subject set, no table state
        const jobId = 'an-id';
        const mockData = {
          exportJob: {
            foo: 'bar'
          }
        };
        let mockConstraint = new TrueConstraint();
        const el1 = new TransmartExportElement();
        const el2 = new TransmartExportElement();
        const elements = [el1, el2];
        let tableState = undefined;
        service.runExportJob(jobId, mockConstraint, elements, tableState).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/export/' + jobId + '/run';
        let req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body['constraint']).toBeDefined();
        expect(req.request.body['constraint']['type']).toBe('true');
        expect(req.request.body['elements']).toBeDefined();
        expect(req.request.body['includeMeasurementDateColumns']).toBeDefined();

        // scenario 2: with auto saved subject set, no table state
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
        service.runExportJob(jobId, mockConstraint, elements, tableState).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        req = httpMock.expectOne(url);
        expect(req.request.body['constraint']['type']).toBe('and');

        // scenario 2: with auto saved subject set, with table state
        tableState = new TransmartTableState(['row1'], []);
        service.runExportJob(jobId, mockConstraint, elements, tableState).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        req = httpMock.expectOne(url);
        expect(req.request.body['tableConfig']).toBeDefined();
        expect(req.request.body['tableConfig']['rowDimensions'][0]).toBe('row1');

        console.log(req.request.body['constraint'])
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

  it('should get categorical aggregate',
    inject([HttpTestingController, TransmartResourceService],
      (httpMock: HttpTestingController, service: TransmartResourceService) => {
        const mockData = {
          aggregatesPerCategoricalConcept: {
            foo: 'bar'
          }
        };
        const mockConstraint = new TrueConstraint();
        service.getCategoricalAggregate(mockConstraint).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/observations/aggregates_per_categorical_concept';
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
      observableOf(testStudies)
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
      Observable.of(new Promise(() => {
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
