import { TestBed, inject } from '@angular/core/testing';

import { CrossTableService } from './cross-table.service';

describe('CrossTableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CrossTableService]
    });
  });

  it('should be created', inject([CrossTableService], (service: CrossTableService) => {
    expect(service).toBeTruthy();
  }));
});
