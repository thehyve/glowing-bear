import {TestBed, inject} from '@angular/core/testing';

import {ConstraintService} from './constraint.service';
import {TreeNodeService} from './tree-node.service';
import {TreeNodeServiceMock} from './mocks/tree-node.service.mock';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';

describe('ConstraintService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
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

  it('ConstraintService should be injected',
    inject([ConstraintService], (service: ConstraintService) => {
    expect(service).toBeTruthy();
  }));
});
