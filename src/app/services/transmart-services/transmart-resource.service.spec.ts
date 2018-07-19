/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {inject, TestBed} from '@angular/core/testing';

import {TransmartResourceService} from './transmart-resource.service';
import {HttpClientModule, HttpErrorResponse} from '@angular/common/http';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock} from '../../config/app.config.mock';
import {MessageHelper} from '../../utilities/message-helper';
import {Study} from '../../models/constraint-models/study';
import {Observable} from 'rxjs/Observable';
import {TransmartStudy} from '../../models/transmart-models/transmart-study';
import {ExportJob} from '../../models/export-models/export-job';
import {TransmartExportElement} from '../../models/transmart-models/transmart-export-element';
import {Constraint} from '../../models/constraint-models/constraint';
import {StudyConstraint} from '../../models/constraint-models/study-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';

describe('TransmartResourceService', () => {

  let transmartResourceService: TransmartResourceService;

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
    transmartResourceService = TestBed.get(TransmartResourceService);
  });

  it('TransmartResourceService should be injected',
    inject([TransmartResourceService], (service: TransmartResourceService) => {
      expect(service).toBeTruthy();
    }));

  it('should fetch studies from the TranSMART resource service', function () {
    let study1 = new TransmartStudy();
    study1.studyId = 'TestStudy1';
    study1.dimensions = ['patient', 'concept', 'start time'];
    let study2 = new TransmartStudy();
    study2.studyId = 'TestStudy2';
    study2.dimensions = ['patient', 'concept', 'trial visit', 'sample_type'];
    let testStudies: TransmartStudy[] = [study1, study2];

    let resourceCall = spyOn(transmartResourceService, 'getStudies').and.callFake(() =>
      Observable.of(testStudies)
    );

    // The first time, the studies should be fetched from the resource
    transmartResourceService.studies.then(studies1 => {
      expect(studies1).toEqual(testStudies);
      expect(resourceCall).toHaveBeenCalledTimes(1);
      // The second time, the studies should already be available
      transmartResourceService.studies.then(studies2 => {
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
    transmartResourceService.studies.then(() =>
      fail()
    ).catch(() => {
      expect(MessageHelper.messages.length).toEqual(messageCount + 1);
      expect(MessageHelper.messages[messageCount].summary).toContain('A server-side error occurred');
    });
  });


  it('should use subject set constraints only in auto-save mode, when they are up to date with the current constraints', () => {
    transmartResourceService.autosaveSubjectSets = true;
    transmartResourceService.subjectSetConstraintForExport = null;
    let constraint: Constraint = null;
    let study = new Study();
    study.id = 'testStudyId';
    constraint = new StudyConstraint();
    (<StudyConstraint>constraint).studies.push(study);
    let subjectConstraint = new SubjectSetConstraint();
    transmartResourceService.subjectSetConstraint = subjectConstraint;
    let elements: TransmartExportElement[] = [new TransmartExportElement()];
    let tableState = null;
    let resourceCall = spyOn(transmartResourceService, 'runExportJob').and.callFake(() =>
      Observable.of(ExportJob)
    );
    // if the _savedSubjectSetConstraints is not up to date with constraint
    // runExportJob should be called with constraint as parameter
    transmartResourceService.runExport('testJobID', constraint, elements, tableState).then (() => {
      expect(resourceCall).toHaveBeenCalledWith('testJobID', constraint, elements, tableState);
    });
    // if the _savedSubjectSetConstraints is up to date with constraint
    // runExportJob should be called with subjectSet as parameter
    transmartResourceService.subjectSetConstraintForExport = constraint;
    transmartResourceService.runExport('testJobID', constraint, elements, tableState).then (() => {
      expect(resourceCall).toHaveBeenCalledWith('testJobID', subjectConstraint, elements, tableState);
    });
  });

});
