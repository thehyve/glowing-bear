import { TestBed, inject } from '@angular/core/testing';

import { DimensionRegistryService } from './dimension-registry.service';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from '../mocks/resource.service.mock';

describe('DimensionRegistryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        DimensionRegistryService
      ]
    });
  });

  it('should inject DimensionRegistryService', inject([DimensionRegistryService], (service: DimensionRegistryService) => {
    expect(service).toBeTruthy();
  }));
});
