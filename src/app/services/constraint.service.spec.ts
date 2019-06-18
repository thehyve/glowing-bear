/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {inject, TestBed} from '@angular/core/testing';
import {ConstraintService} from './constraint.service';
import {TreeNodeService} from './tree-node.service';
import {TreeNodeServiceMock} from './mocks/tree-node.service.mock';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {StudyService} from './study.service';
import {StudyServiceMock} from './mocks/study.service.mock';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {StudyConstraint} from '../models/constraint-models/study-constraint';
import {Concept} from '../models/constraint-models/concept';
import {TrueConstraint} from '../models/constraint-models/true-constraint';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {Constraint} from '../models/constraint-models/constraint';
import {CountServiceMock} from './mocks/count.service.mock';
import {CountService} from './count.service';
import {PedigreeConstraint} from '../models/constraint-models/pedigree-constraint';

describe('ConstraintService', () => {
  let constraintService: ConstraintService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConstraintService,
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: CountService,
          useClass: CountServiceMock
        },
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: StudyService,
          useClass: StudyServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        }
      ]
    });
    constraintService = TestBed.get(ConstraintService);
  });

  it('should be injected',
    inject([ConstraintService], (service: ConstraintService) => {
      expect(service).toBeTruthy();
    }));

  it('should search all constraints', () => {
    let c1 = new ConceptConstraint();
    c1.textRepresentation = 'foo';
    let c2 = new StudyConstraint();
    c2.textRepresentation = 'bar';
    constraintService.allConstraints = [c1, c2];
    let result = constraintService.searchAllConstraints('');
    expect(result.length).toBe(2);
    result = constraintService.searchAllConstraints('fo');
    expect(result.length).toBe(1);
    result = constraintService.searchAllConstraints('non-exist');
    expect(result.length).toBe(0);
  });

  it('should generate variables constraint', () => {
    let c1 = new Concept();
    c1.name = 'c1';
    c1.selected = true;
    let c2 = new Concept();
    c2.name = 'c2';
    c2.selected = true;
    let result = constraintService.variableConstraint([c1, c2]);
    expect(result).toEqual(jasmine.any(TrueConstraint));

    c1.selected = false;
    let result2 = constraintService.variableConstraint([c1, c2]);
    expect(result2).toEqual(jasmine.any(CombinationConstraint));
    expect((result2 as CombinationConstraint).children
      .filter(c => c instanceof ConceptConstraint).length)
      .toBe(1);
  });


  it('should restore cohort constraint with proper root dimension', () => {
    let constraint1 = new CombinationConstraint();
    constraint1.dimension = 'diagnosis';
    let constraint11 = new ConceptConstraint();
    constraint1.addChild(constraint11);

    let constraint2 = new ConceptConstraint();

    expect(constraintService.dimensionSelectionDisabled).toBe(false);
    constraintService.restoreCohortConstraint(constraint1);
    expect(constraintService.rootConstraint.dimension).toEqual('diagnosis');
    expect(constraintService.dimensionSelectionDisabled).toBe(true);

    constraintService.restoreCohortConstraint(constraint2);
    expect(constraintService.rootConstraint.dimension).toEqual('patient');
    expect(constraintService.dimensionSelectionDisabled).toBe(true);
  });
});
