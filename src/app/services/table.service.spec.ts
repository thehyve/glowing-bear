import {TestBed, inject} from '@angular/core/testing';

import {TableService} from './table.service';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {ConstraintService} from "./constraint.service";
import {ConstraintServiceMock} from "./mocks/constraint.service.mock";

describe('TableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        TableService
      ]
    });
  });
  it('should inject TableService', inject([TableService], (service: TableService) => {
    expect(service).toBeTruthy();
  }));
});
