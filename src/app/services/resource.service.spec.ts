import {TestBed, inject} from '@angular/core/testing';

import {ResourceService} from './resource.service';
import {EndpointService} from './endpoint.service';
import {EndpointServiceMock} from './mocks/endpoint.service.mock';
import {TransmartResourceService} from './transmart-resource/transmart-resource.service';
import {TransmartResourceServiceMock} from './mocks/transmart-resource.service.mock';

describe('ResourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ResourceService,
        {
          provide: EndpointService,
          useClass: EndpointServiceMock
        },
        {
          provide: TransmartResourceService,
          useClass: TransmartResourceServiceMock
        }
      ]
    });
  });

  it('ResourceService should be injected', inject([ResourceService], (service: ResourceService) => {
    expect(service).toBeTruthy();
  }));
});
