/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {inject, TestBed} from '@angular/core/testing';

import {ConstraintService} from './constraint.service';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {CohortService} from './cohort.service';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';
import {AppConfig} from '../config/app.config';
import {AppConfigMock} from '../config/app.config.mock';
import {HttpErrorResponse} from '@angular/common/http';
import {of as observableOf} from 'rxjs';
import {Cohort} from '../models/cohort-models/cohort';
import {CohortSubscriptionFrequency} from '../models/cohort-models/cohort-subscription-frequency';
import {ErrorHelper} from '../utilities/error-helper';
import {throwError} from 'rxjs/internal/observable/throwError';
import {CountService} from './count.service';
import {CountServiceMock} from './mocks/count.service.mock';


describe('CohortService', () => {
  let resourceService: ResourceService;
  let cohortService: CohortService;
  let httpErrorResponse: HttpErrorResponse;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AppConfig,
          useClass: AppConfigMock
        },
        {
          provide: CountService,
          useClass: CountServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        CohortService
      ]
    });
    resourceService = TestBed.inject(ResourceService);
    cohortService = TestBed.inject(CohortService);
    httpErrorResponse = new HttpErrorResponse({
      error: 'error',
      headers: null,
      status: 404,
      statusText: 'status text',
      url: 'url'
    });
  });

  it('should be injected', inject([CohortService], (service: CohortService) => {
    expect(service).toBeTruthy();
  }));

  it('should handle loaded cohorts', () => {
    let q = new Cohort('test query id', 'test query name');
    q.createDate = '2015-03-25';
    q.updateDate = '2015-03-26';
    q.subscribed = true;
    q.bookmarked = true;
    let q1 = new Cohort('test query id 1', 'test query name 1');
    q1.createDate = null;
    q1.updateDate = null;
    q1.subscribed = true;
    q1.bookmarked = false;
    q1.subscriptionFreq = CohortSubscriptionFrequency.DAILY;
    let q2 = new Cohort('test query id 2', 'test query name 2');
    q2.createDate = null;
    q2.updateDate = null;
    q2.subscribed = false;
    q2.bookmarked = true;
    q2.subscriptionFreq = CohortSubscriptionFrequency.WEEKLY;
    let spy1 = spyOn(resourceService, 'diffCohort').and.callFake((_id: string) => {
      return observableOf([]);
    });
    let spy2 = spyOn(cohortService, 'parseCohortDiffRecords').and.stub();
    cohortService.handleLoadedCohorts([q, q1, q2]);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(q.subscriptionFreq).toBe(CohortSubscriptionFrequency.WEEKLY);
    expect(cohortService.cohorts[0].id).toBe('');
    expect(cohortService.cohorts[1].id).toBe(q.id);
    expect(cohortService.cohorts[2].id).toBe(q2.id);
    expect(cohortService.cohorts[3].id).toBe(q1.id);
  });

  it('should delete a cohort', () => {
    let spy = spyOn(resourceService, 'deleteCohort').and.callThrough();
    let query = new Cohort('test-id', 'test-name');
    cohortService.cohorts = [query];
    cohortService.deleteCohort(query);
    expect(spy).toHaveBeenCalledWith(query.id);
    expect(cohortService.cohorts.length).toEqual(0);

    let query1 = new Cohort('test-id-1', 'test-name-1');
    cohortService.cohorts = [query1];
    cohortService.deleteCohort(query);
    expect(cohortService.cohorts.length).toEqual(1);
  })

  it('should handle cohort deletion error', () => {
    let spy = spyOn(resourceService, 'deleteCohort').and.callFake(() => {
      return throwError(null);
    })
    let spy1 = spyOn(ErrorHelper, 'handleError').and.stub();
    let query = new Cohort('test-id', 'test-name');
    cohortService.cohorts = [query];
    cohortService.deleteCohort(query);
    expect(spy).toHaveBeenCalledWith(query.id);
    expect(cohortService.cohorts.length).toEqual(1);
    expect(spy1).toHaveBeenCalled();
  })

});
