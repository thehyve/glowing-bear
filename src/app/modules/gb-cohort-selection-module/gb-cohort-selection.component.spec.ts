/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbCohortSelectionComponent} from './gb-cohort-selection.component';
import {
  AutoCompleteModule,
  CalendarModule,
  CheckboxModule,
  InputSwitchModule,
  MessagesModule,
  OverlayPanelModule,
  TooltipModule,
  TreeModule
} from 'primeng';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ConstraintService} from '../../services/constraint.service';
import {ConstraintServiceMock} from '../../services/mocks/constraint.service.mock';
import {routing} from './gb-cohort-selection.routing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CohortService} from '../../services/cohort.service';
import {CohortServiceMock} from '../../services/mocks/cohort.service.mock';
import {MockComponent} from 'ng2-mock-component';
import {CountService} from '../../services/count.service';
import {CountServiceMock} from '../../services/mocks/count.service.mock';

describe('GbCohortSelectionComponent', () => {
  let component: GbCohortSelectionComponent;
  let fixture: ComponentFixture<GbCohortSelectionComponent>;
  let cohortService: CohortService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbCohortSelectionComponent,
        MockComponent({selector: 'gb-constraint', inputs: ['constraint', 'isRoot']})
      ],
      imports: [
        BrowserAnimationsModule,
        routing,
        CommonModule,
        FormsModule,
        AutoCompleteModule,
        CheckboxModule,
        CalendarModule,
        TreeModule,
        MessagesModule,
        TooltipModule,
        OverlayPanelModule,
        InputSwitchModule
      ],
      providers: [
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: CohortService,
          useClass: CohortServiceMock
        },
        {
          provide: CountService,
          useClass: CountServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbCohortSelectionComponent);
    component = fixture.componentInstance;
    cohortService = TestBed.get(CohortService);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should save a cohort', () => {
    spyOn(component, 'saveCohort').and.callThrough();
    component.saveCohort();
    expect(component.saveCohort).toHaveBeenCalled();
    // when name is defined
    component.cohortName = 'test name';
    spyOn(cohortService, 'saveCohortByName').and.callThrough();
    component.saveCohort();
    expect(cohortService.saveCohortByName).toHaveBeenCalled();
  });

  it('should prevent node drop on top panel', () => {
    let func = function () {
    };
    let event = {
      stopPropagation: func,
      preventDefault: func
    };
    spyOn(component, 'preventNodeDrop').and.callThrough();
    spyOn(event, 'stopPropagation').and.callThrough();
    spyOn(event, 'preventDefault').and.callThrough();
    component.preventNodeDrop(event);
    expect(component.preventNodeDrop).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

});
