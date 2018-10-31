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
  AutoCompleteModule, CalendarModule, CheckboxModule, TreeModule, MessagesModule,
  TooltipModule, OverlayPanelModule
} from 'primeng/primeng';
import {Md2AccordionModule} from 'md2';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ResourceServiceMock} from '../../services/mocks/resource.service.mock';
import {ResourceService} from '../../services/resource.service';
import {TreeNodeServiceMock} from '../../services/mocks/tree-node.service.mock';
import {TreeNodeService} from '../../services/tree-node.service';
import {ConstraintService} from '../../services/constraint.service';
import {ConstraintServiceMock} from '../../services/mocks/constraint.service.mock';
import {routing} from './gb-cohort-selection.routing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CohortService} from '../../services/cohort.service';
import {CohortServiceMock} from '../../services/mocks/cohort.service.mock';
import {DataTableService} from '../../services/data-table.service';
import {DataTableServiceMock} from '../../services/mocks/data-table.service.mock';
import {MockComponent} from 'ng2-mock-component';

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
        Md2AccordionModule,
        CheckboxModule,
        CalendarModule,
        TreeModule,
        MessagesModule,
        TooltipModule,
        OverlayPanelModule
      ],
      providers: [
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
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
          provide: DataTableService,
          useClass: DataTableServiceMock
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
