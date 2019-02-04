import { TestBed } from '@angular/core/testing';

import { GbBackendHttpService } from './gb-backend-http.service';

describe('GbBackendHttpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GbBackendHttpService = TestBed.get(GbBackendHttpService);
    expect(service).toBeTruthy();
  });
});
