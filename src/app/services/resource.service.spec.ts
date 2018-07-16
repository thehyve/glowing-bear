/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed, inject} from '@angular/core/testing';

import {ResourceService} from './resource.service';
import {TransmartResourceService} from './transmart-services/transmart-resource.service';
import {TransmartResourceServiceMock} from './mocks/transmart-resource.service.mock';
import {Study} from '../models/constraint-models/study';
import {TrueConstraint} from '../models/constraint-models/true-constraint';
import {CountItem} from '../models/aggregate-models/count-item';

describe('ResourceService', () => {
  let resourceService: ResourceService;
  let transmartResourceService: TransmartResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ResourceService,
        {
          provide: TransmartResourceService,
          useClass: TransmartResourceServiceMock
        }
      ]
    });
    resourceService = TestBed.get(ResourceService);
    transmartResourceService = TestBed.get(TransmartResourceService);
  });

  it('should be injected', inject([ResourceService], (service: ResourceService) => {
    expect(service).toBeTruthy();
  }));

  it('should get studies', () => {
    resourceService.getStudies()
      .subscribe((studies: Study[]) => {
        expect(studies.length).toBe(2);
        expect(studies[0].id).toBe('CATEGORICAL_VALUES');
      });
    resourceService.endpointMode = null;
    resourceService.getStudies()
      .subscribe((studies: Study[]) => {
        expect(studies.length).toBe(2);
        expect(studies[0].id).toBe('CATEGORICAL_VALUES');
      });
  })

  it('should udpate inclusion and exclusion counts', () => {
    let dummy = new TrueConstraint();
    resourceService.updateInclusionExclusionCounts(dummy, dummy, dummy)
      .then(() => {
        expect(resourceService.inclusionCounts.subjectCount).toEqual(10);
        expect(resourceService.exclusionCounts.subjectCount).toEqual(0);
        expect(resourceService.selectedStudyConceptCountMap.size).toEqual(1);
      });
    resourceService.endpointMode = null;
    resourceService.updateInclusionExclusionCounts(dummy, dummy, dummy)
      .then(() => {
        expect(resourceService.inclusionCounts.subjectCount).toEqual(10);
        expect(resourceService.exclusionCounts.subjectCount).toEqual(0);
        expect(resourceService.selectedStudyConceptCountMap.size).toEqual(1);
      });
  })

  it('should get counts per concept', () => {
    let dummy = new TrueConstraint();
    resourceService.getCountsPerConcept(dummy)
      .subscribe((map: Map<string, CountItem>) => {
        expect(map.size).toBe(2);
        expect(map.has('EHR:VSIGN:HR')).toBe(true);
      })
    resourceService.endpointMode = null;
    resourceService.getCountsPerConcept(dummy)
      .subscribe((map: Map<string, CountItem>) => {
        expect(map.size).toBe(2);
      })
  })

  it('should get counts per study', () => {
    let dummy = new TrueConstraint();
    resourceService.getCountsPerStudy(dummy)
      .subscribe((map: Map<string, CountItem>) => {
        expect(map.size).toBe(2);
      })
    resourceService.endpointMode = null;
    resourceService.getCountsPerStudy(dummy)
      .subscribe((map: Map<string, CountItem>) => {
        expect(map.size).toBe(2);
      })
  })

  it('should get counts per study and concept', () => {
    let dummy = new TrueConstraint();
    resourceService.getCountsPerStudyAndConcept(dummy)
      .subscribe((map: Map<string, Map<string, CountItem>>) => {
        expect(map.size).toBe(1);
        expect(map.get('EHR').size).toBe(2);
      })
    resourceService.endpointMode = null;
    resourceService.getCountsPerStudyAndConcept(dummy)
      .subscribe((map: Map<string, Map<string, CountItem>>) => {
        expect(map.size).toBe(1);
        expect(map.get('EHR').size).toBe(2);
      })
  })

  it('should get counts', () => {
    let dummy = new TrueConstraint();
    resourceService.getCounts(dummy)
      .subscribe((item: CountItem) => {
        expect(item.subjectCount).toBe(23);
        expect(item.observationCount).toBe(46);
      });
    resourceService.endpointMode = null;
    resourceService.getCounts(dummy)
      .subscribe((item: CountItem) => {
        expect(item.subjectCount).toBe(23);
        expect(item.observationCount).toBe(46);
      });
  })

});
