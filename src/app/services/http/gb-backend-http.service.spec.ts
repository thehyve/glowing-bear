/**
 * Copyright 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {inject, TestBed} from '@angular/core/testing';
import {GbBackendHttpService} from './gb-backend-http.service';
import {AppConfigPackerMock} from '../../config/app.config.mock';
import {HttpClientModule} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {AppConfig} from '../../config/app.config';
import {CohortRepresentation} from '../../models/gb-backend-models/cohort-representation';
import {CohortSubscriptionFrequency} from '../../models/cohort-models/cohort-subscription-frequency';

describe('GbBackendHttpService', () => {
  let gbBackendHttpService: GbBackendHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule
      ],
      providers: [
        GbBackendHttpService,
        {
          provide: AppConfig,
          useClass: AppConfigPackerMock
        }
      ]
    });
    gbBackendHttpService = TestBed.inject(GbBackendHttpService);
  });

  afterEach(inject([HttpTestingController], (httpMock: HttpTestingController) => {
    httpMock.verify();
  }));

  it('should be injected',
    inject([GbBackendHttpService], (service: GbBackendHttpService) => {
      expect(service).toBeTruthy();
    }));

  it('should save query',
    inject([HttpTestingController, GbBackendHttpService],
      (httpMock: HttpTestingController, service: GbBackendHttpService) => {

        let query = new CohortRepresentation('custom_name', 'testDimension');
        query.subscribed = true;
        query.subscriptionFreq = CohortSubscriptionFrequency.DAILY;
        query.queryConstraint = {type: 'true'};

        service.saveQuery(query).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/queries';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('POST');
        const body: CohortRepresentation = req.request.body;
        expect(body.name).toBe('custom_name');
        expect(body.subjectDimension).toBe('testDimension');
        expect(body.queryConstraint).toBeDefined();
        expect(body.queryConstraint.type).toBe('true');
        expect(body.bookmarked).toBe(false);
        expect(body.subscribed).toBe(true);
        expect(body.subscriptionFreq).toBe('DAILY');
        expect(body.queryBlob).not.toBeDefined();
      }));

  it('should get queries',
    inject([HttpTestingController, GbBackendHttpService],
      (httpMock: HttpTestingController, service: GbBackendHttpService) => {
        service.getQueries().subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/queries';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('GET');
      }));

  it('should delete query',
    inject([HttpTestingController, GbBackendHttpService],
      (httpMock: HttpTestingController, service: GbBackendHttpService) => {
        let id = 'query1';
        service.deleteQuery(id).subscribe(() => {});
        const url = service.endpointUrl + '/queries/' + id;
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('DELETE');
      }));

  it('should update query',
    inject([HttpTestingController, GbBackendHttpService],
      (httpMock: HttpTestingController, service: GbBackendHttpService) => {
        let id = 'query2';
        let query = {
          name: 'changed'
        };
        service.updateQuery(id, query).subscribe(() => {});
        const url = service.endpointUrl + '/queries/' + id;
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('PUT');
      }));

  it('should return query diff',
    inject([HttpTestingController, GbBackendHttpService],
      (httpMock: HttpTestingController, service: GbBackendHttpService) => {
        let id = 'query3';
        service.diffQuery(id).subscribe((res) => {
          expect(res['foo']).toBe('bar');
        });
        const url = service.endpointUrl + '/queries/' + id + '/sets';
        const req = httpMock.expectOne(url);
        expect(req.request.method).toEqual('GET');
      }));
});
