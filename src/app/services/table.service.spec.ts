import {TestBed, inject} from '@angular/core/testing';

import {TableService} from './table.service';
import {ResourceHelperService} from "./resource-helper.service";
import {ResourceHelperServiceMock} from "./mocks/resource-helper.service.mock";
import {ResourceService} from "./resource.service";
import {ResourceServiceMock} from "./mocks/resource.service.mock";

describe('TableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TableService,
        {
          provide: ResourceHelperService,
          useClass: ResourceHelperServiceMock
        }
      ]
    });
  });

  it('TableService should be created', inject([TableService], (service: TableService) => {
    expect(service).toBeTruthy();
  }));
});
