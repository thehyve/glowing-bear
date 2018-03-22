import {TestBed, inject} from '@angular/core/testing';

import {TableService} from './table.service';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';

describe('TableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TableService,
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        }
      ]
    });
  });

  it('TableService should be created', inject([TableService], (service: TableService) => {
    expect(service).toBeTruthy();
  }));
});
