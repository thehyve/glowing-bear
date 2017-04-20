import { TestBed, inject } from '@angular/core/testing';

import { DimensionRegistryService } from './dimension-registry.service';

describe('DimensionRegistryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DimensionRegistryService]
    });
  });

  it('should ...', inject([DimensionRegistryService], (service: DimensionRegistryService) => {
    expect(service).toBeTruthy();
  }));
});
