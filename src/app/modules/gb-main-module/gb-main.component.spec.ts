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
import {CohortService} from '../../services/cohort.service';
import {CohortServiceMock} from '../../services/mocks/cohort.service.mock';
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
import {GbCohortSelectionModule} from '../gb-cohort-selection-module/gb-cohort-selection.module';
import {TransmartHttpService} from '../../services/http/transmart-http.service';
import {DataTableService} from '../../services/data-table.service';
import {ExportService} from '../../services/export.service';
import {CrossTableServiceMock} from '../../services/mocks/cross-table.service.mock';
import {TransmartHttpServiceMock} from '../../services/mocks/transmart-http.service.mock';
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
import {TransmartPackerHttpService} from '../../services/http/transmart-packer-http.service';
import {TransmartPackerHttpServiceMock} from '../../services/mocks/transmart-packer-http.service.mock';
import {TransmartResourceService} from '../../services/transmart-resource.service';
import {TransmartResourceServiceMock} from '../../services/mocks/transmart-resource.service.mock';
import {FractalisService} from '../../services/fractalis.service';
import {FractalisServiceMock} from '../../services/mocks/fractalis.service.mock';
import {GbBackendHttpService} from '../../services/http/gb-backend-http.service';
import {GbBackendHttpServiceMock} from '../../services/mocks/gb-backend-http.service.mock';

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
        GbCohortSelectionModule,
        GbAnalysisModule,
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
          provide: TransmartHttpService,
          useClass: TransmartHttpServiceMock
        },
        {
          provide: TransmartPackerHttpService,
          useClass: TransmartPackerHttpServiceMock
        },
        {
          provide: GbBackendHttpService,
          useClass: GbBackendHttpServiceMock
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
          provide: CohortService,
          useClass: CohortServiceMock
        },
        {
          provide: FractalisService,
          useClass: FractalisServiceMock
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
