/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbConstraintComponent} from './gb-constraint.component';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {StudyConstraint} from '../../../../models/constraint-models/study-constraint';
import {ConceptConstraint} from '../../../../models/constraint-models/concept-constraint';
import {CombinationConstraint} from '../../../../models/constraint-models/combination-constraint';
import {CohortServiceMock} from '../../../../services/mocks/cohort.service.mock';
import {CohortService} from '../../../../services/cohort.service';
import {MockComponent} from 'ng2-mock-component';
import {StudyService} from '../../../../services/study.service';
import {StudyServiceMock} from '../../../../services/mocks/study.service.mock';
import {AuthenticationService} from '../../../../services/authentication/authentication.service';
import {AuthenticationServiceMock} from '../../../../services/mocks/authentication.service.mock';
import {DropdownModule, InputSwitchModule} from 'primeng/primeng';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

describe('GbConstraintComponent', () => {
  let component: GbConstraintComponent;
  let fixture: ComponentFixture<GbConstraintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbConstraintComponent,
        MockComponent({selector: 'gb-combination-constraint', inputs: ['constraint']}),
        MockComponent({selector: 'gb-study-constraint', inputs: ['constraint']}),
        MockComponent({selector: 'gb-concept-constraint', inputs: ['constraint']}),
        MockComponent({selector: 'gb-subject-set-constraint', inputs: ['constraint']}),
        MockComponent({selector: 'gb-pedigree-constraint', inputs: ['constraint']})
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
      ],
      imports: [
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        InputSwitchModule,
        DropdownModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbConstraintComponent);
    component = fixture.componentInstance;
    component.constraint = new StudyConstraint();
    fixture.detectChanges();
  });

  it('should create GbConstraintComponent for StudyConstraint', () => {
    component.constraint = new StudyConstraint();
    expect(component.constraint.className).toBe('StudyConstraint');
    expect(component).toBeTruthy();
  });

  it('should create GbConstraintComponent for ConceptConstraint', () => {
    component.constraint = new ConceptConstraint();
    expect(component.constraint.className).toBe('ConceptConstraint');
    expect(component).toBeTruthy();
  });

  it('should create GbConstraintComponent for CombinationConstraint', () => {
    component.constraint = new CombinationConstraint();
    expect(component.constraint.className).toBe('CombinationConstraint');
    expect(component).toBeTruthy();
  });

  it('should emit remove event', () => {
    let spy1 = spyOn(component.constraintRemoved, 'emit').and.stub();
    component.remove();
    expect(spy1).toHaveBeenCalled();
  });

  it('should handle drag and drop', () => {
    let dragStart: DragEvent = new DragEvent('dragstart');
    let dragOver: DragEvent = new DragEvent('dragover');
    let dragLeave: DragEvent = new DragEvent('dragleave');
    let drop: DragEvent = new DragEvent('drop');

    let spy1 = spyOn(dragStart, 'stopPropagation').and.stub();
    let spy2 = spyOn(dragStart, 'preventDefault').and.stub();
    let spy3 = spyOn(dragOver, 'stopPropagation').and.stub();
    let spy4 = spyOn(dragOver, 'preventDefault').and.stub();
    let spy5 = spyOn(drop, 'preventDefault').and.stub();

    component.onDragEnter(dragStart);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(component.element.nativeElement.firstChild.classList).toContain('dropzone');

    component.onDragOver(dragOver);
    expect(spy3).toHaveBeenCalled();
    expect(spy4).toHaveBeenCalled();
    expect(component.element.nativeElement.firstChild.classList).toContain('dropzone');

    component.onDragLeave(dragLeave);
    expect(component.element.nativeElement.firstChild.classList).not.toContain('dropzone');

    component.onDrop(drop);
    expect(spy5).toHaveBeenCalled();
    expect(component.element.nativeElement.firstChild.classList).not.toContain('dropzone');
  });

  it('should add a proper observation level box message', () => {
    let constraint1 = new CombinationConstraint();
    constraint1.dimension = 'patient';
    let constraint11 = new ConceptConstraint();
    constraint1.addChild(constraint11);

    component.constraint = constraint11;
    expect(component.observationBoxMessage).toBe('for the patient there is an observation:');

    component.constraint.negated = true;
    expect(component.observationBoxMessage).toBe('for the patient there are NO observations:');
  });

});
