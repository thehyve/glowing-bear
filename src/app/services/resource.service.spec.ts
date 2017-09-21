import {TestBed, inject} from '@angular/core/testing';

import {ResourceService} from './resource.service';
import {HttpModule} from '@angular/http';
import {EndpointService} from './endpoint.service';
import {EndpointServiceMock} from './mocks/endpoint.service.mock';

describe('ResourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule
      ],
      providers: [
        ResourceService,
        {
          provide: EndpointService,
          useClass: EndpointServiceMock
        }
      ]
    });
  });

  it('should inject ResourceService', inject([ResourceService], (service: ResourceService) => {
    expect(service).toBeTruthy();
  }));
});
