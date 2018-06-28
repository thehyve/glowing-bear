import {TestBed, inject} from '@angular/core/testing';

import {TransmartStudiesService} from './transmart-studies.service';
import {TransmartResourceService} from './transmart-resource.service';
import {TransmartResourceServiceMock} from '../mocks/transmart-resource.service.mock';
import {Observable} from 'rxjs/Observable';
import {Study} from '../../models/constraint-models/study';
import {MessageHelper} from '../../utilities/message-helper';
import {HttpErrorResponse} from '@angular/common/http';

describe('TransmartStudiesService', () => {

  let transmartResourceService: TransmartResourceService;
  let transmartStudiesService: TransmartStudiesService;

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
    transmartResourceService = TestBed.get(TransmartResourceService);
    transmartStudiesService = TestBed.get(TransmartStudiesService);
  });

  it('should be injected', inject([TransmartStudiesService], (service: TransmartStudiesService) => {
    expect(service).toBeTruthy();
  }));

  it('should fetch studies from the TranSMART resource service', function () {
    let study1 = new Study();
    study1.studyId = 'TestStudy1';
    study1.dimensions = ['patient', 'concept', 'start time'];
    let study2 = new Study();
    study2.studyId = 'TestStudy2';
    study2.dimensions = ['patient', 'concept', 'trial visit', 'sample_type'];
    let testStudies: Study[] = [study1, study2];

    let resourceCall = spyOn(transmartResourceService, 'getStudies').and.callFake(() =>
      Observable.of(testStudies)
    );

    // The first time, the studies should be fetched from the resource
    transmartStudiesService.studies.then(studies1 => {
      expect(studies1).toEqual(testStudies);
      expect(resourceCall).toHaveBeenCalledTimes(1);
      // The second time, the studies should already be available
      transmartStudiesService.studies.then(studies2 => {
        expect(studies2).toEqual(testStudies);
        expect(resourceCall).toHaveBeenCalledTimes(1);
      });
    }).catch(() =>
      fail()
    );
  });

  it('should notify the user when studies cannot be fetched', function () {
    spyOn(transmartResourceService, 'getStudies').and.callFake(() =>
      Observable.fromPromise(new Promise(() => {
        throw new HttpErrorResponse({status: 500});
      }))
    );

    let messageCount = MessageHelper.messages.length;
    // The first time, the studies should be fetched from the resource
    transmartStudiesService.studies.then(() =>
      fail()
    ).catch(() => {
      expect(MessageHelper.messages.length).toEqual(messageCount + 1);
      expect(MessageHelper.messages[messageCount].summary).toContain('A server-side error occurred');
    });
  });

});
