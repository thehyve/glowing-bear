import { TestBed, inject } from '@angular/core/testing';

import { ResourceHelperService } from './resource-helper.service';
import {ResourceService} from "./resource.service";
import {ResourceServiceMock} from "./mocks/resource.service.mock";

describe('ResourceHelperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ResourceHelperService,
          {
            provide: ResourceService,
            useClass: ResourceServiceMock
          }
        ]
      });
  });

  it('should be created', inject([ResourceHelperService], (service: ResourceHelperService) => {
    expect(service).toBeTruthy();
  }));
});
