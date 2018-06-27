import {TestBed, inject} from '@angular/core/testing';

import {TransmartStudiesService} from './transmart-studies.service';
import {TransmartResourceService} from './transmart-resource.service';
import {TransmartResourceServiceMock} from '../mocks/transmart-resource.service.mock';

describe('TransmartStudiesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TransmartResourceService,
          useClass: TransmartResourceServiceMock
        },
        TransmartStudiesService
      ]
    });
  });

  it('should be injected', inject([TransmartStudiesService], (service: TransmartStudiesService) => {
    expect(service).toBeTruthy();
  }));
});
