import { TestBed, inject } from '@angular/core/testing';

import { TransmartResourceService } from './transmart-resource.service';

describe('TransmartResourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransmartResourceService]
    });
  });

  it('should be created', inject([TransmartResourceService], (service: TransmartResourceService) => {
    expect(service).toBeTruthy();
  }));
});
