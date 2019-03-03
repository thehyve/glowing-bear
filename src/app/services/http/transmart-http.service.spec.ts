/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {inject, TestBed} from '@angular/core/testing';

import {TransmartHttpService} from './transmart-http.service';
import {HttpClientModule, HttpErrorResponse} from '@angular/common/http';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock} from '../../config/app.config.mock';
import {MessageHelper} from '../../utilities/message-helper';
import {Observable} from 'rxjs/Observable';
import {TransmartStudy} from '../../models/transmart-models/transmart-study';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {of as observableOf} from 'rxjs';
import {TransmartExportElement} from '../../models/transmart-models/transmart-export-element';
import {TransmartTableState} from '../../models/transmart-models/transmart-table-state';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {TransmartConstraintMapper} from '../../utilities/transmart-utilities/transmart-constraint-mapper';
import {Concept} from '../../models/constraint-models/concept';
import {ConstraintMark} from '../../models/constraint-models/constraint-mark';

describe('TransmartHttpService', () => {

  let transmartHttpService: TransmartHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule
      ],
      providers: [
        TransmartHttpService,
        {
          provide: AppConfig,
          useClass: AppConfigMock
        }
      ]
    });
    transmartHttpService = TestBed.get(TransmartHttpService);
  });

  afterEach(inject([HttpTestingController], (httpMock: HttpTestingController) => {
    httpMock.verify();
  }));

  it('should be injected',
    inject([TransmartHttpService], (service: TransmartHttpService) => {
      expect(service).toBeTruthy();
    }));

  it('should get tree nodes',
    inject([HttpTestingController, TransmartHttpService],
      (httpMock: HttpTestingController, service: TransmartHttpService) => {
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
    inject([HttpTestingController, TransmartHttpService],
      (httpMock: HttpTestingController, service: TransmartHttpService) => {
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
    inject([HttpTestingController, TransmartHttpService],
      (httpMock: HttpTestingController, service: TransmartHttpService) => {
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
    inject([HttpTestingController, TransmartHttpService],
      (httpMock: HttpTestingController, service: TransmartHttpService) => {
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
    inject([HttpTestingController, TransmartHttpService],
      (httpMock: HttpTestingController, service: TransmartHttpService) => {
        const mockData = {
          fileFormats: {
            foo: 'bar'
          }
        };
        let dataView = 'dataTable';
        service.getExportFileFormats(dataView).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/export/file_formats?dataView=dataTable';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('GET');
        req.flush(mockData);
      }));

  it('should download export job',
    inject([HttpTestingController, TransmartHttpService],
      (httpMock: HttpTestingController, service: TransmartHttpService) => {
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
    inject([HttpTestingController, TransmartHttpService],
      (httpMock: HttpTestingController, service: TransmartHttpService) => {
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
    inject([HttpTestingController, TransmartHttpService],
      (httpMock: HttpTestingController, service: TransmartHttpService) => {
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
    inject([HttpTestingController, TransmartHttpService],
      (httpMock: HttpTestingController, service: TransmartHttpService) => {
        // scenario 1: no table state
        const jobId = 'an-id';

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

        // scenario 2: with table state
        tableState = new TransmartTableState(['row1'], []);
        service.runExportJob(jobId, mockConstraint, elements, tableState).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body['tableConfig']).toBeDefined();
        expect(req.request.body['tableConfig']['rowDimensions'][0]).toBe('row1');
      }));

  it('should get trial visits',
    inject([HttpTestingController, TransmartHttpService],
      (httpMock: HttpTestingController, service: TransmartHttpService) => {
        const mockData = {
          elements: {
            foo: 'bar'
          }
        };
        const mockConstraint = new TrueConstraint();
        service.getTrialVisits(mockConstraint).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/dimensions/trial visit/elements';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body).toEqual({constraint: {type: 'true'}});
        req.flush(mockData);
      }));

  it('should get patients',
    inject([HttpTestingController, TransmartHttpService],
      (httpMock: HttpTestingController, service: TransmartHttpService) => {
        const mockData = {
          patients: {
            foo: 'bar'
          }
        };
        const mockConstraint = new TrueConstraint();
        service.getPatients(mockConstraint).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/patients';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('POST');
        req.flush(mockData);
      }));

  it('should get aggregate',
    inject([HttpTestingController, TransmartHttpService],
      (httpMock: HttpTestingController, service: TransmartHttpService) => {
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
    inject([HttpTestingController, TransmartHttpService],
      (httpMock: HttpTestingController, service: TransmartHttpService) => {
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
    inject([HttpTestingController, TransmartHttpService],
      (httpMock: HttpTestingController, service: TransmartHttpService) => {
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
    inject([HttpTestingController, TransmartHttpService],
      (httpMock: HttpTestingController, service: TransmartHttpService) => {
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
    inject([HttpTestingController, TransmartHttpService],
      (httpMock: HttpTestingController, service: TransmartHttpService) => {
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
    inject([HttpTestingController, TransmartHttpService],
      (httpMock: HttpTestingController, service: TransmartHttpService) => {
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

    let resourceCall = spyOn(transmartHttpService, 'getStudies').and.callFake(() =>
      observableOf(testStudies)
    );

    // The first time, the studies should be fetched from the resource
    transmartHttpService.studies.then(studies1 => {
      expect(studies1).toEqual(testStudies);
      expect(resourceCall).toHaveBeenCalledTimes(1);
      // The second time, the studies should already be available
      transmartHttpService.studies.then(studies2 => {
        expect(studies2).toEqual(testStudies);
        expect(resourceCall).toHaveBeenCalledTimes(1);
      });
    }).catch(() =>
      fail()
    );
  });

  it('should notify the user when studies cannot be fetched', function () {
    spyOn(transmartHttpService, 'getStudies').and.callFake(() =>
      Observable.of(new Promise(() => {
        throw new HttpErrorResponse({status: 500});
      }))
    );

    let messageCount = MessageHelper.messages.length;
    // The first time, the studies should be fetched from the resource
    transmartHttpService.studies.then(() =>
      fail()
    ).catch(() => {
      expect(MessageHelper.messages.length).toEqual(messageCount);
      expect(MessageHelper.messages[messageCount].summary).toContain('A server-side error occurred');
    });
  });

  it('should not wrap constraints into patient subselection',
    inject([HttpTestingController, TransmartHttpService],
    (httpMock: HttpTestingController, service: TransmartHttpService) => {
      const mockData = {
        foo: 'bar'
      };
      const c1 = new ConceptConstraint();
      c1.concept = new Concept();
      const mockConstraint = new CombinationConstraint();
      mockConstraint.addChild(c1);
      mockConstraint.dimension = 'patient';
      let spy = spyOn(TransmartConstraintMapper, 'wrapWithCombinationConstraint').and.callThrough();

      service.getCounts(mockConstraint).subscribe((res) => {
        expect(res['foo']).toBe('bar');
      });
      const url = service.endpointUrl + '/observations/counts';
      const req = httpMock.expectOne(url);

      expect(spy).not.toHaveBeenCalled();
      expect(req.request.body).toEqual({
        constraint: {
          type: 'concept',
          conceptCode: undefined
        }
      });
      req.flush(mockData);

    }));

  it('should wrap constraints into patient subselection',
    inject([HttpTestingController, TransmartHttpService],
      (httpMock: HttpTestingController, service: TransmartHttpService) => {
        const mockData = {
          foo: 'bar'
        };
      const c1 = new ConceptConstraint();
      c1.concept = new Concept();
      const mockConstraint = new CombinationConstraint();
      mockConstraint.mark = ConstraintMark.SUBJECT;
      mockConstraint.addChild(c1);
      mockConstraint.dimension = 'Diagnosis ID';
      mockConstraint.children[0].dimension = 'Diagnosis ID';
      let spy = spyOn(TransmartConstraintMapper, 'wrapWithCombinationConstraint').and.callThrough();

      service.getCounts(mockConstraint).subscribe((res) => {
        expect(res['foo']).toBe('bar');
      });
      const url = service.endpointUrl + '/observations/counts';
      const req2 = httpMock.expectOne(url);
      expect(spy).toHaveBeenCalled();
      expect(req2.request.body).toEqual({
        constraint: {
          type: 'subselection',
          dimension: 'patient',
          constraint: {
            type: 'subselection',
            dimension: 'Diagnosis ID',
            constraint: {
              type: 'concept',
              conceptCode: undefined
            }
          }
        }
      });
      req2.flush(mockData);

    }));

});
