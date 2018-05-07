import {TestBed, inject} from '@angular/core/testing';

import {CrossTableService} from './cross-table.service';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';

describe('CrossTableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        CrossTableService
      ]
    });
  });

  it('should be created', inject([CrossTableService], (service: CrossTableService) => {
    expect(service).toBeTruthy();
  }));
});
