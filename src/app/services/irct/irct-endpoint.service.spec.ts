import {TestBed, inject} from '@angular/core/testing';

import {IRCTEndPointService} from './irct-endpoint.service';
import {HttpClientModule} from '@angular/common/http';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock} from '../../config/app.config.mock';

describe('IRCTEndPointService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [
        IRCTEndPointService,
        {
          provide: AppConfig,
          useClass: AppConfigMock
        }
      ]
    });
  });

  it('should be created', inject([IRCTEndPointService], (service: IRCTEndPointService) => {
    expect(service).toBeTruthy();
  }));
});
