/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed, async, ComponentFixture} from '@angular/core/testing';

import {AppComponent} from './app.component';
import {routing} from './app.routing';
import {AppConfig} from './config/app.config';
import {APP_INITIALIZER, DebugElement} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ResourceService} from './services/resource.service';
import {AuthenticationService} from './services/authentication/authentication.service';
import {TreeNodeService} from './services/tree-node.service';
import {ConstraintService} from './services/constraint.service';
import {APP_BASE_HREF} from '@angular/common';
import {AuthenticationServiceMock} from './services/mocks/authentication.service.mock';
import {ResourceServiceMock} from './services/mocks/resource.service.mock';
import {TreeNodeServiceMock} from './services/mocks/tree-node.service.mock';
import {ConstraintServiceMock} from './services/mocks/constraint.service.mock';
import {AppConfigMock} from './config/app.config.mock';
import {GbDataSelectionModule} from './modules/gb-data-selection-module/gb-data-selection.module';
import {GbAnalysisModule} from './modules/gb-analysis-module/gb-analysis.module';
import {GbNavBarModule} from './modules/gb-navbar-module/gb-navbar.module';
import {GbSidePanelModule} from './modules/gb-side-panel-module/gb-side-panel.module';
import {QueryService} from './services/query.service';
import {QueryServiceMock} from './services/mocks/query.service.mock';
import {DataTableService} from './services/data-table.service';
import {DataTableServiceMock} from './services/mocks/data-table.service.mock';
import {TransmartResourceService} from './services/transmart-services/transmart-resource.service';
import {TransmartResourceServiceMock} from './services/mocks/transmart-resource.service.mock';
import {CrossTableService} from './services/cross-table.service';
import {CrossTableServiceMock} from './services/mocks/cross-table.service.mock';
import {NavbarService} from './services/navbar.service';
import {NavbarServiceMock} from './services/mocks/navbar.service.mock';
import {ExportService} from './services/export.service';
import {ExportServiceMock} from './services/mocks/export.service.mock';
import {GrowlModule} from 'primeng/growl';
import {GbMainModule} from './modules/gb-main-module/gb-main.module';
import {MessageHelper} from './utilities/message-helper';
import {of as observableOf} from 'rxjs';
import {TransmartExternalJobResourceService} from './services/transmart-services/transmart-external-job-resource.service';
import {TransmartExternalJobResourceServiceMock} from './services/mocks/transmart-external-job-resource.service.mock';

export function initConfig(config: AppConfig) {
  return () => config.load();
}

describe('AppComponent', () => {

  let fixture: ComponentFixture<AppComponent>;
  let debugElement: DebugElement;
  let component: AppComponent;
  let authenticationService: AuthenticationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        GrowlModule,
        GbMainModule,
        GbNavBarModule,
        GbSidePanelModule,
        GbDataSelectionModule,
        GbAnalysisModule,
        routing
      ],
      providers: [
        {
          provide: AppConfig,
          useClass: AppConfigMock
        },
        {
          provide: APP_BASE_HREF,
          useValue: '/'
        },
        {
          provide: APP_INITIALIZER,
          useFactory: initConfig,
          deps: [AppConfig],
          multi: true
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
          provide: TransmartExternalJobResourceService,
          useClass: TransmartExternalJobResourceServiceMock
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
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    debugElement = fixture.debugElement;
    component = fixture.componentInstance;
    authenticationService = TestBed.get(AuthenticationService);
  }));

  it('should be created', async(() => {
    expect(component).toBeTruthy();
  }));

  it('should logout', () => {
    spyOn(component, 'logout').and.callThrough();
    spyOn(authenticationService, 'logout').and.callThrough();
    component.logout();
    expect(component.logout).toHaveBeenCalled();
    expect(authenticationService.logout).toHaveBeenCalled();
  });

  it('should get messages', () => {
    spyOnProperty(component, 'messages', 'get').and.callThrough();
    expect(component.messages).toBe(MessageHelper.messages);
  });

  it('should set messages', () => {
    const dummy = [{foo: 'bar'}];
    spyOnProperty(component, 'messages', 'set').and.callThrough();
    component.messages = dummy;
    expect(component.messages).toBe(dummy);
  });

  it('should handle authentication success', () => {
    let authenticated = true;
    let authorisedCall = spyOnProperty(authenticationService, 'authorised', 'get')
      .and.callFake(() => {
        return observableOf(authenticated);
      });
    let messageHelperCall = spyOn(MessageHelper, 'alert').and.stub();
    component.ngOnInit();
    expect(authorisedCall).toHaveBeenCalledTimes(1);
    expect(messageHelperCall).toHaveBeenCalledTimes(1);
    expect(messageHelperCall).toHaveBeenCalledWith('success', 'Authentication successful!');
    expect(component.authenticationCompleted).toEqual(true);
  });

  it('should handle authentication failure', () => {
    let authenticated = false;
    let authorisedCall = spyOnProperty(authenticationService, 'authorised', 'get')
      .and.callFake(() => {
        return observableOf(authenticated);
      });
    let messageHelperCall = spyOn(MessageHelper, 'alert').and.stub();
    component.ngOnInit();
    expect(authorisedCall).toHaveBeenCalledTimes(1);
    expect(messageHelperCall).toHaveBeenCalledTimes(0);
    expect(component.authenticationCompleted).toEqual(false);
  });

});
