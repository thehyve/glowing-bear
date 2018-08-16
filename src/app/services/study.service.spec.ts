/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed, inject} from '@angular/core/testing';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {StudyService} from './study.service';


describe('StudyService', () => {
  let studyService: ResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StudyService,
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        }
      ]
    });
    studyService = TestBed.get(StudyService);
  });

  it('should be injected', inject([StudyService], (service: StudyService) => {
    expect(service).toBeTruthy();
  }));

});
