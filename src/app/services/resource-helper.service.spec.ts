import { TestBed, inject } from '@angular/core/testing';

import { ResourceHelperService } from './resource-helper.service';

describe('ResourceHelperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResourceHelperService]
    });
  });

  it('should be created', inject([ResourceHelperService], (service: ResourceHelperService) => {
    expect(service).toBeTruthy();
  }));
});
