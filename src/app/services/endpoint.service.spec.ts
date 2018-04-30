import {TestBed, inject} from '@angular/core/testing';

import {EndpointService} from './endpoint.service';
import {AppConfig} from '../config/app.config';
import {HttpModule} from '@angular/http';
import {AppConfigMock} from '../config/app.config.mock';

describe('EndpointService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule
      ],
      providers: [
        {
          provide: AppConfig,
          useClass: AppConfigMock
        },
        EndpointService
      ]
    });
  });

  it('should be injected', inject([EndpointService], (service: EndpointService) => {
    expect(service).toBeTruthy();
  }));
});
