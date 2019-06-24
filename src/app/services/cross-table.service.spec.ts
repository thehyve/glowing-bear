/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed, inject} from '@angular/core/testing';
import {CrossTableService} from './cross-table.service';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {TrueConstraint} from '../models/constraint-models/true-constraint';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {Concept} from '../models/constraint-models/concept';
import {ConceptType} from '../models/constraint-models/concept-type';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {CombinationState} from '../models/constraint-models/combination-state';
import {CohortService} from './cohort.service';
import {CohortServiceMock} from './mocks/cohort.service.mock';
import {Cohort} from '../models/cohort-models/cohort';

describe('CrossTableService', () => {
  let crossTableService: CrossTableService;
  let cohortService: CohortService;
  let resourceService: ResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: CohortService,
          useClass: CohortServiceMock
        },
        CrossTableService
      ]
    });
    crossTableService = TestBed.get(CrossTableService);
    resourceService = TestBed.get(ResourceService);
    cohortService = TestBed.get(CohortService);
  });

  it('should be created',
    inject([CrossTableService], (service: CrossTableService) => {
      expect(service).toBeTruthy();
    }));

  it('should check if a constraint is valid for cross table', () => {
    let categoricalConcept = new ConceptConstraint();
    let concept = new Concept();
    concept.type = ConceptType.CATEGORICAL;
    categoricalConcept.concept = concept;
    let combi = new CombinationConstraint();
    combi.addChild(categoricalConcept);
    combi.addChild(new TrueConstraint());
    let spy1 = spyOn(crossTableService, 'isValidConstraint').and.callThrough();
    let result = crossTableService.isValidConstraint(combi);
    expect(spy1).toHaveBeenCalled();
    expect(result).toBe(true);
    result = crossTableService.isValidConstraint(new TrueConstraint());
    expect(result).toBe(false);

    combi.addChild(categoricalConcept);
    result = crossTableService.isValidConstraint(combi);
    expect(result).toBe(false);

    combi.combinationState = CombinationState.Or;
    result = crossTableService.isValidConstraint(combi);
    expect(result).toBe(false);
  });

  it('should get and set selectedConstraintCell', () => {
    let spyGet =
      spyOnProperty(crossTableService, 'selectedConstraintCell', 'get').and.callThrough();
    let spySet =
      spyOnProperty(crossTableService, 'selectedConstraintCell', 'set').and.callThrough();
    crossTableService.selectedConstraintCell = null;
    expect(crossTableService.selectedConstraintCell).toBe(null);
    expect(spyGet).toHaveBeenCalled();
    expect(spySet).toHaveBeenCalled();
  });

  it('should update cells when cohorts are changed', () => {
    let spyUpdateCells = spyOn(crossTableService, 'updateCells').and.callThrough();
    let cohort1 = new Cohort('id1', 'name1');
    cohort1.selected = true;
    let cohort2 = new Cohort('id2', 'name2');
    cohort2.selected = true;
    cohortService.cohortsUpdated.asObservable()
      .subscribe(res => {
        expect(spyUpdateCells).toHaveBeenCalled();
      });
    cohortService.cohortsUpdated.next([cohort1, cohort2]);
  });

});
