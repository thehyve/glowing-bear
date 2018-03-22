import { TestBed, inject } from '@angular/core/testing';

import { TransmartMapperService } from './transmart-mapper.service';

describe('TransmartMapperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransmartMapperService]
    });
  });

  it('should be created', inject([TransmartMapperService], (service: TransmartMapperService) => {
    expect(service).toBeTruthy();
  }));
});
