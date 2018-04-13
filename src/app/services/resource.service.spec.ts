import {TestBed, inject} from '@angular/core/testing';

import {ResourceService} from './resource.service';
import {TransmartResourceService} from './transmart-resource/transmart-resource.service';
import {TransmartResourceServiceMock} from './mocks/transmart-resource.service.mock';

describe('ResourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ResourceService,
        {
          provide: TransmartResourceService,
          useClass: TransmartResourceServiceMock
        }
      ]
    });
  });

  it('should inject ResourceService', inject([ResourceService], (service: ResourceService) => {
    expect(service).toBeTruthy();
  }));
});
