import {TestBed, inject} from '@angular/core/testing';

import {ConstraintService} from './constraint.service';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from '../mocks/resource.service.mock';
import {DimensionRegistryService} from './dimension-registry.service';
import {DimensionRegistryServiceMock} from '../mocks/dimension-registry.service.mock';

describe('ConstraintService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DimensionRegistryService,
          useClass: DimensionRegistryServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        ConstraintService
      ]
    });
  });

  it('should inject ConstraintService', inject([ConstraintService], (service: ConstraintService) => {
    expect(service).toBeTruthy();
  }));
});
