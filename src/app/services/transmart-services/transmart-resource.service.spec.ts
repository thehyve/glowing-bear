import {TestBed, inject} from '@angular/core/testing';

import {TransmartResourceService} from './transmart-resource.service';
import {HttpClientModule} from '@angular/common/http';
import {EndpointService} from '../endpoint.service';
import {EndpointServiceMock} from '../mocks/endpoint.service.mock';

describe('TransmartResourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [
        TransmartResourceService,
        {
          provide: EndpointService,
          useClass: EndpointServiceMock
        }
      ]
    });
  });

  it('should be created', inject([TransmartResourceService], (service: TransmartResourceService) => {
    expect(service).toBeTruthy();
  }));
});
