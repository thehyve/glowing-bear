import {inject, TestBed} from '@angular/core/testing';

import {CountService} from './count.service';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {AppConfig} from '../config/app.config';
import {AppConfigMock} from '../config/app.config.mock';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {SubjectSetConstraint} from '../models/constraint-models/subject-set-constraint';

describe('CountService', () => {
  let countService: CountService;
  let resourceService: ResourceService;
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
    resourceService = TestBed.get(ResourceService);
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

  it('should request counts if non subject set aware constraint', () => {
    let resourceServiceCounts = spyOn(countService['resourceService'], 'getCounts');
    countService.showObservationCounts = false;
    let conceptConstraint = new ConceptConstraint();

    countService.getCounts(conceptConstraint);

    expect(resourceServiceCounts).toHaveBeenCalledWith(conceptConstraint);
  });

  it('should request counts if observation count is needed', () => {
    let resourceServiceCounts = spyOn(countService['resourceService'], 'getCounts');
    countService.showObservationCounts = true;
    let subjectSetConstraint = new SubjectSetConstraint();

    countService.getCounts(subjectSetConstraint);

    expect(resourceServiceCounts).toHaveBeenCalledWith(subjectSetConstraint);
  });

  it('should reuse subject set counts', () => {
    let resourceServiceCounts = spyOn(resourceService, 'getCounts');
    countService.showObservationCounts = false;
    let subjectSetConstraint = new SubjectSetConstraint();
    subjectSetConstraint.setSize = 10;

    countService.getCounts(subjectSetConstraint).subscribe((counts) => {
      expect(counts.subjectCount).toEqual(10);
      expect(counts.observationCount).toEqual(-1);
    });

    expect(resourceServiceCounts).not.toHaveBeenCalled();
  });

});
