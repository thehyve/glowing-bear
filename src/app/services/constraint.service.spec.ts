import {TestBed, inject} from '@angular/core/testing';

import {ConstraintService} from './constraint.service';
import {TreeNodeService} from './tree-node.service';
import {TreeNodeServiceMock} from './mocks/tree-node.service.mock';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {AuthenticationService} from './authentication/authentication.service';
import {AuthenticationServiceMock} from './mocks/authentication.service.mock';

describe('ConstraintService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceMock
        },
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        ConstraintService
      ]
    });
  });

  it('should be created',
    inject([ConstraintService], (service: ConstraintService) => {
    expect(service).toBeTruthy();
  }));
});
