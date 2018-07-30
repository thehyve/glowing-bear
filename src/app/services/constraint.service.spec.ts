/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed, inject} from '@angular/core/testing';

import {ConstraintService} from './constraint.service';
import {TreeNodeService} from './tree-node.service';
import {TreeNodeServiceMock} from './mocks/tree-node.service.mock';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {AuthenticationService} from './authentication/authentication.service';
import {AuthenticationServiceMock} from './mocks/authentication.service.mock';
import {StudiesService} from './studies.service';
import {StudiesServiceMock} from './mocks/studies.service.mock';

describe('ConstraintService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: StudiesService,
          useClass: StudiesServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        ConstraintService
      ]
    });
  });

  it('should be injected',
    inject([ConstraintService], (service: ConstraintService) => {
      expect(service).toBeTruthy();
    }));
});
