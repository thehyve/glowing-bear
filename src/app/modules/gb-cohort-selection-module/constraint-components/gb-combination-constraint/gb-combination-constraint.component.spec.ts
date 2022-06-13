/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {GbCombinationConstraintComponent} from './gb-combination-constraint.component';
import {AutoCompleteModule, DropdownModule} from 'primeng';
import {FormsModule} from '@angular/forms';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {CombinationConstraint} from '../../../../models/constraint-models/combination-constraint';
import {CohortService} from '../../../../services/cohort.service';
import {CohortServiceMock} from '../../../../services/mocks/cohort.service.mock';
import {MockComponent} from 'ng2-mock-component';
import {StudyConstraint} from '../../../../models/constraint-models/study-constraint';
import {ConceptConstraint} from '../../../../models/constraint-models/concept-constraint';
import {StudyService} from '../../../../services/study.service';
import {StudyServiceMock} from '../../../../services/mocks/study.service.mock';
import {AuthenticationService} from '../../../../services/authentication/authentication.service';
import {AuthenticationServiceMock} from '../../../../services/mocks/authentication.service.mock';
import {Concept} from '../../../../models/constraint-models/concept';
import {PedigreeConstraint} from '../../../../models/constraint-models/pedigree-constraint';
import {CombinationState} from '../../../../models/constraint-models/combination-state';

describe('GbCombinationConstraintComponent', () => {
  let component: GbCombinationConstraintComponent;
  let fixture: ComponentFixture<GbCombinationConstraintComponent>;
  let constraintService: ConstraintService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbCombinationConstraintComponent,
        MockComponent({selector: 'gb-constraint', inputs: ['constraint']})
      ],
      imports: [
        FormsModule,
        AutoCompleteModule,
        DropdownModule
      ],
      providers: [
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceMock
        },
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: CohortService,
          useClass: CohortServiceMock
        },
        {
          provide: StudyService,
          useClass: StudyServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbCombinationConstraintComponent);
    component = fixture.componentInstance;
    component.constraint = new CombinationConstraint();
    fixture.detectChanges();
    constraintService = TestBed.inject(ConstraintService);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should handle dropdown action', () => {
    let c1 = new StudyConstraint();
    let c2 = new ConceptConstraint();
    let dummies = [c1, c2];
    spyOn(constraintService, 'searchAllConstraints').and.returnValue(dummies);
    let e = new MouseEvent('');
    e['originalEvent'] = new MouseEvent('');
    component.onDropdown(e);
    expect(component.searchResults).toBe(dummies);
  });

  it('should handle cohort type change action', () => {
    component.constraint = new CombinationConstraint();
    let newDimension = 'test dimension';
    let spy1 = spyOn(component, 'update').and.callThrough();
    let spy2 = spyOn(component, 'handleSelectedDimensionChange').and.callThrough();

    component.selectedDimension = newDimension;
    component.onSelectedDimensionChange();

    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect((<CombinationConstraint>component.constraint).dimension).toBe(newDimension);
  });

  it('should not propagate selected cohort type on children combination constraint', () => {
    let constraint1 = new StudyConstraint();
    let constraint2 = new CombinationConstraint();
    let constraint21 = new ConceptConstraint();
    let constraint22 = new ConceptConstraint();
    constraint2.addChild(constraint21);
    constraint2.addChild(constraint22);
    component.constraint = new CombinationConstraint();
    (<CombinationConstraint>component.constraint).addChild(constraint1);
    (<CombinationConstraint>component.constraint).addChild(constraint2);

    component.selectedDimension = 'test dimension';
    component.onSelectedDimensionChange();

    expect((<CombinationConstraint>(<CombinationConstraint>component.constraint)
      .children[1]).dimension).toEqual(CombinationConstraint.TOP_LEVEL_DIMENSION);
  });

  it('should add a proper box description message', () => {
    let constraint1 = new CombinationConstraint();
    constraint1.isRoot = true;
    constraint1.dimension = 'patient';
    let constraint11 = new CombinationConstraint();
    constraint11.negated = true;
    let constraint12 = new ConceptConstraint();
    constraint1.addChild(constraint11);
    constraint1.addChild(constraint12);

    component.constraint = constraint1;
    expect(component.subjectBoxMessage).toBe('Select data linked to');

    component.constraint = constraint11;
    expect(component.subjectBoxMessage).toBe('the patient is NOT linked to a');

    component.constraint = constraint12;
    expect(component.subjectBoxMessage).toBe('the patient is linked to a');
  });

  it('should wrap concept constraint with combination when concept restricted to a dimensions', () => {
    component.constraint = new CombinationConstraint();
    (<CombinationConstraint>component.constraint).dimension = 'Diagnosis ID';

    let selectedConceptConstraint = new ConceptConstraint();
    selectedConceptConstraint.concept = new Concept();
    selectedConceptConstraint.concept.subjectDimensions.push('Biosource ID');

    component.onSelect(selectedConceptConstraint);
    expect((<CombinationConstraint>component.constraint).dimension).toBe('Diagnosis ID');
    let children = (<CombinationConstraint>component.constraint).children;
    expect(children.length).toBe(1);
    expect(children[0].className).toBe('CombinationConstraint');
    expect((<CombinationConstraint>children[0]).dimension).toBe('Biosource ID');
    expect((<CombinationConstraint>children[0]).children.length).toBe(1);
    expect((<CombinationConstraint>children[0]).children[0].className).toBe('ConceptConstraint');
  });

  it('should not wrap concept constraint with combination when concept not restricted to dimensions', () => {
    component.constraint = new CombinationConstraint();
    (<CombinationConstraint>component.constraint).dimension = 'Diagnosis ID';

    let selectedConceptConstraint = new ConceptConstraint();
    selectedConceptConstraint.concept = new Concept();
    selectedConceptConstraint.concept.subjectDimensions.push('Diagnosis ID');

    component.onSelect(selectedConceptConstraint);
    expect((<CombinationConstraint>component.constraint).dimension).toBe('Diagnosis ID');
    let children = (<CombinationConstraint>component.constraint).children;
    expect(children.length).toBe(1);
    expect(children[0].className).toBe('ConceptConstraint');
  });

  it('should wrap pedigree constraint with patient-level combination', () => {
    component.constraint = new CombinationConstraint();
    (<CombinationConstraint>component.constraint).dimension = 'Diagnosis ID';
    let selectedConceptConstraint = new PedigreeConstraint('PAR');

    component.onSelect(selectedConceptConstraint);
    expect((<CombinationConstraint>component.constraint).dimension).toBe('Diagnosis ID');
    let children = (<CombinationConstraint>component.constraint).children;
    expect(children.length).toBe(1);
    expect(children[0].className).toBe('CombinationConstraint');
    expect((<CombinationConstraint>children[0]).dimension).toBe('patient');
    expect((<CombinationConstraint>children[0]).children.length).toBe(1);
    expect((<CombinationConstraint>children[0]).children[0].className).toBe('PedigreeConstraint');
  });

  it('should restore constraints with subject dimensions', () => {

    component.constraint = new CombinationConstraint();
    component.updateDimensionDropdownOptions();
    expect(component.disableDimensionDropdown).toBe(false);

    let c1 = new ConceptConstraint();
    c1.textRepresentation = 'foo';
    c1.concept = new Concept();
    c1.concept.subjectDimensions.push('diagnosis');
    component.constraint = new CombinationConstraint([c1], CombinationState.And, 'diagnosis');
    component.updateDimensionDropdownOptions();
    expect(component.disableDimensionDropdown).toBe(true);

    component.onConstraintRemoved(c1);
    expect(component.disableDimensionDropdown).toBe(false);
  });

});
