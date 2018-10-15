/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {APP_BASE_HREF} from '@angular/common';
import {routing} from '../../app.routing';
import {FormsModule} from '@angular/forms';
import {QueryService} from '../../services/query.service';
import {QueryServiceMock} from '../../services/mocks/query.service.mock';
import {NavbarService} from '../../services/navbar.service';
import {NavbarServiceMock} from '../../services/mocks/navbar.service.mock';
import {GbMainComponent} from './gb-main.component';
import {BrowserModule} from '@angular/platform-browser';
import {GbSidePanelModule} from '../gb-side-panel-module/gb-side-panel.module';
import {HttpClientModule} from '@angular/common/http';
import {GrowlModule} from 'primeng/growl';
import {GbAnalysisModule} from '../gb-analysis-module/gb-analysis.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {GbNavBarModule} from '../gb-navbar-module/gb-navbar.module';
import {GbDataSelectionModule} from '../gb-data-selection-module/gb-data-selection.module';
import {TransmartResourceService} from '../../services/transmart-services/transmart-resource.service';
import {DataTableService} from '../../services/data-table.service';
import {ExportService} from '../../services/export.service';
import {CrossTableServiceMock} from '../../services/mocks/cross-table.service.mock';
import {TransmartResourceServiceMock} from '../../services/mocks/transmart-resource.service.mock';
import {CrossTableService} from '../../services/cross-table.service';
import {TreeNodeServiceMock} from '../../services/mocks/tree-node.service.mock';
import {ResourceServiceMock} from '../../services/mocks/resource.service.mock';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import {ConstraintService} from '../../services/constraint.service';
import {ExportServiceMock} from '../../services/mocks/export.service.mock';
import {ConstraintServiceMock} from '../../services/mocks/constraint.service.mock';
import {ResourceService} from '../../services/resource.service';
import {TreeNodeService} from '../../services/tree-node.service';
import {DataTableServiceMock} from '../../services/mocks/data-table.service.mock';
import {AuthenticationServiceMock} from '../../services/mocks/authentication.service.mock';
import {AngularSplitModule} from 'angular-split';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock} from '../../config/app.config.mock';
import {GbFractalisModule} from "../gb-fractalis-module/gb-fractalis.module";

describe('GbMainComponent', () => {
  let component: GbMainComponent;
  let fixture: ComponentFixture<GbMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbMainComponent
      ],
      imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AngularSplitModule,
        GrowlModule,
        GbNavBarModule,
        GbSidePanelModule,
        GbDataSelectionModule,
        GbAnalysisModule,
        GbFractalisModule,
        routing
      ],
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: '/'
        },
        {
          provide: AppConfig,
          useClass: AppConfigMock
        },
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceMock
        },
        {
          provide: TransmartResourceService,
          useClass: TransmartResourceServiceMock
        },
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
        },
        {
          provide: CrossTableService,
          useClass: CrossTableServiceMock
        },
        {
          provide: NavbarService,
          useClass: NavbarServiceMock
        },
        {
          provide: ExportService,
          useClass: ExportServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbMainComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  })

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
