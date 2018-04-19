import {TestBed, inject} from '@angular/core/testing';

import {TransmartResourceService} from './transmart-resource.service';
import {HttpClientModule} from '@angular/common/http';
import {EndpointService} from '../endpoint.service';
import {EndpointServiceMock} from '../mocks/endpoint.service.mock';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock} from '../../config/app.config.mock';

describe('TransmartResourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [
        TransmartResourceService,
        {
          provide: AppConfig,
          useClass: AppConfigMock
        }
      ]
    });
  });

  it('TransmartResourceService should be injected',
    inject([TransmartResourceService], (service: TransmartResourceService) => {
      expect(service).toBeTruthy();
    }));
});
