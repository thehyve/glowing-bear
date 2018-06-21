import { TestBed, inject } from '@angular/core/testing';

import { PicSureResourceService } from './picsure-resource.service';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock} from '../../config/app.config.mock';

// todo
describe('PicSureResourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PicSureResourceService,
        {
          provide: AppConfig,
          useClass: AppConfigMock
        }
      ]
    });
  });

  it('should be created', inject([PicSureResourceService], (service: PicSureResourceService) => {
    expect(service).toBeTruthy();
  }));
});
