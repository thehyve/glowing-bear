/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbDataSelectionComponent} from './gb-data-selection.component';
import {
  AutoCompleteModule, CalendarModule, CheckboxModule, TreeModule, MessagesModule,
  TooltipModule
} from 'primeng/primeng';
import {Md2AccordionModule} from 'md2';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {EndpointServiceMock} from '../../services/mocks/endpoint.service.mock';
import {ResourceServiceMock} from '../../services/mocks/resource.service.mock';
import {ResourceService} from '../../services/resource.service';
import {TreeNodeServiceMock} from '../../services/mocks/tree-node.service.mock';
import {TreeNodeService} from '../../services/tree-node.service';
import {ConstraintService} from '../../services/constraint.service';
import {ConstraintServiceMock} from '../../services/mocks/constraint.service.mock';
import {routing} from './gb-data-selection.routing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {QueryService} from '../../services/query.service';
import {QueryServiceMock} from '../../services/mocks/query.service.mock';
import {MockComponent} from 'ng2-mock-component';
import {DataTableService} from '../../services/data-table.service';
import {DataTableServiceMock} from '../../services/mocks/data-table.service.mock';

describe('GbDataSelectionComponent', () => {
  let component: GbDataSelectionComponent;
  let fixture: ComponentFixture<GbDataSelectionComponent>;
  let queryService: QueryService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbDataSelectionComponent,
        MockComponent({selector: 'gb-selection'}),
        MockComponent({selector: 'gb-projection'}),
        MockComponent({selector: 'gb-data-table'})
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
        TooltipModule
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
          provide: QueryService,
          useClass: QueryServiceMock
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
    fixture = TestBed.createComponent(GbDataSelectionComponent);
    component = fixture.componentInstance;
    queryService = TestBed.get(QueryService);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should save query', () => {
    spyOn(component, 'saveQuery').and.callThrough();
    component.saveQuery();
    expect(component.saveQuery).toHaveBeenCalled();
    // when queryName is defined
    component.queryName = 'test name';
    spyOn(queryService, 'saveQueryByName').and.callThrough();
    component.saveQuery();
    expect(queryService.saveQueryByName).toHaveBeenCalled();
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
