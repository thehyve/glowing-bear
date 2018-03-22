import {TestBed, inject} from '@angular/core/testing';

import {ConstraintService} from './constraint.service';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {TreeNodeService} from './tree-node.service';
import {TreeNodeServiceMock} from './mocks/tree-node.service.mock';
import {QueryService} from './query.service';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';

describe('QueryService', () => {
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
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        QueryService
      ]
    });
  });

  it('should inject ConstraintService', inject([ConstraintService], (service: ConstraintService) => {
    expect(service).toBeTruthy();
  }));
});
