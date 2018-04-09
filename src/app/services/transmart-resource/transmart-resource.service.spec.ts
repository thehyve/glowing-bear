import {TestBed, inject} from '@angular/core/testing';

import {TransmartResourceService} from './transmart-resource.service';
import {HttpClientModule} from '@angular/common/http';

describe('TransmartResourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [
        TransmartResourceService
      ]
    });
  });

  it('should be created', inject([TransmartResourceService], (service: TransmartResourceService) => {
    expect(service).toBeTruthy();
  }));
});
