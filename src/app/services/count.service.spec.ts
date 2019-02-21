import {inject, TestBed} from '@angular/core/testing';

import {CountService} from './count.service';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {AppConfig} from '../config/app.config';
import {AppConfigMock} from '../config/app.config.mock';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';

describe('CountService', () => {
  let countService: CountService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AppConfig,
          useClass: AppConfigMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        CountService
      ]
    });
    countService = TestBed.get(CountService);
  });

  it('should be injected',
    inject([CountService], (service: CountService) => {
      expect(service).toBeTruthy();
    }));

  it('should update counts', (done) => {
    countService.updateCurrentSelectionCount(new ConceptConstraint())
      .then(() => {
        expect(countService).toBeTruthy();
        expect(countService.currentSelectionCount).toBeDefined();
        done();
      })
      .catch((error) => {
        fail('Unexpected error: ' + error);
        done();
      });
  });
});
