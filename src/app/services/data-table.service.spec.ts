import {TestBed, inject} from '@angular/core/testing';

import {DataTableService} from './data-table.service';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {ConstraintService} from './constraint.service';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';

describe('DataTableService', () => {
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
        DataTableService
      ]
    });
  });
  it('should be injected', inject([DataTableService], (service: DataTableService) => {
    expect(service).toBeTruthy();
  }));
});
