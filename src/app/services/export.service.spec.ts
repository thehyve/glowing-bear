/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed, inject} from '@angular/core/testing';

import {ExportService} from './export.service';
import {ConstraintService} from './constraint.service';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {DataTableService} from './data-table.service';
import {DataTableServiceMock} from './mocks/data-table.service.mock';
import {DatePipe} from '@angular/common';

describe('ExportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: DataTableService,
          useClass: DataTableServiceMock
        },
        ExportService,
        DatePipe
      ]
    });
  });

  it('should be injected', inject([ExportService], (service: ExportService) => {
    expect(service).toBeTruthy();
  }));
});
