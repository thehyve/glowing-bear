/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed, inject} from '@angular/core/testing';

import {DataTableService} from './data-table.service';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {ConstraintService} from './constraint.service';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';

describe('DataTableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        DataTableService
      ]
    });
  });
  it('should be injected', inject([DataTableService], (service: DataTableService) => {
    expect(service).toBeTruthy();
  }));
});
