import { TestBed, inject } from '@angular/core/testing';

import { IRCTResourceService } from './irct-resource.service';
import {IRCTEndPointService} from './irct-endpoint.service';
import {IRCTEndPointServiceMock} from '../mocks/irct-endpoint.service.mock';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock} from '../../config/app.config.mock';

describe('IRCTResourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IRCTResourceService,
        {
          provide: IRCTEndPointService,
          useClass: IRCTEndPointServiceMock
        },
        {
          provide: AppConfig,
          useClass: AppConfigMock
        }
      ]
    });
  });

  it('should be created', inject([IRCTResourceService], (service: IRCTResourceService) => {
    expect(service).toBeTruthy();
  }));
});
