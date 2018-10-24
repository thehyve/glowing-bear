/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbSidePanelComponent} from './gb-side-panel.component';
import {CommonModule} from '@angular/common';
import {
  AccordionModule, AutoCompleteModule, ButtonModule, ConfirmationService, ConfirmDialogModule, DataListModule,
  DragDropModule, InputTextModule, OverlayPanelModule, PanelModule,
  TooltipModule, TreeModule, RadioButtonModule
} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {GbTreeNodesComponent} from './accordion-components/gb-tree-nodes/gb-tree-nodes.component';
import {ConstraintService} from '../../services/constraint.service';
import {ConstraintServiceMock} from '../../services/mocks/constraint.service.mock';
import {TreeNodeServiceMock} from '../../services/mocks/tree-node.service.mock';
import {TreeNodeService} from '../../services/tree-node.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {GbCohortsComponent} from './accordion-components/gb-cohorts/gb-cohorts.component';
import {QueryService} from '../../services/query.service';
import {QueryServiceMock} from '../../services/mocks/query.service.mock';
import {Md2AccordionModule} from 'md2';
import {NavbarServiceMock} from '../../services/mocks/navbar.service.mock';
import {NavbarService} from '../../services/navbar.service';
import {CrossTableService} from '../../services/cross-table.service';
import {CrossTableServiceMock} from '../../services/mocks/cross-table.service.mock';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock} from '../../config/app.config.mock';

describe('GbSidePanelComponent', () => {
  let component: GbSidePanelComponent;
  let fixture: ComponentFixture<GbSidePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbSidePanelComponent,
        GbTreeNodesComponent,
        GbCohortsComponent
      ],
      imports: [
        BrowserAnimationsModule,
        CommonModule,
        AccordionModule,
        TreeModule,
        OverlayPanelModule,
        DataListModule,
        DragDropModule,
        FormsModule,
        AutoCompleteModule,
        PanelModule,
        ButtonModule,
        InputTextModule,
        TooltipModule,
        ConfirmDialogModule,
        Md2AccordionModule,
        RadioButtonModule
      ],
      providers: [
        {
          provide: AppConfig,
          useClass: AppConfigMock
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
          provide: NavbarService,
          useClass: NavbarServiceMock
        },
        {
          provide: CrossTableService,
          useClass: CrossTableServiceMock
        },
        ConfirmationService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
