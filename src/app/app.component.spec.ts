/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AppComponent} from './app.component';
import {routing} from './app.routing';
import {AppConfig} from './config/app.config';
import {APP_INITIALIZER, DebugElement} from '@angular/core';
import {BrowserModule, By} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ResourceService} from './services/resource.service';
import {AuthenticationService} from './services/authentication/authentication.service';
import {APP_BASE_HREF} from '@angular/common';
import {AuthenticationServiceMock} from './services/mocks/authentication.service.mock';
import {ResourceServiceMock} from './services/mocks/resource.service.mock';
import {AppConfigMock} from './config/app.config.mock';
import {GbCohortSelectionModule} from './modules/gb-cohort-selection-module/gb-cohort-selection.module';
import {GbAnalysisModule} from './modules/gb-analysis-module/gb-analysis.module';
import {GbNavBarModule} from './modules/gb-navbar-module/gb-navbar.module';
import {GbSidePanelModule} from './modules/gb-side-panel-module/gb-side-panel.module';
import {GrowlModule} from 'primeng/growl';
import {GbMainModule} from './modules/gb-main-module/gb-main.module';
import {MessageHelper} from './utilities/message-helper';
import {of as observableOf} from 'rxjs';
import {ServerStatus} from './models/server-status';
import {GbMainComponent} from './modules/gb-main-module/gb-main.component';
import {Router} from '@angular/router';
import {NavbarService} from './services/navbar.service';
import {NavbarServiceMock} from './services/mocks/navbar.service.mock';

export function initConfig(config: AppConfig) {
  return () => config.load();
}

describe('AppComponent', () => {

  let fixture: ComponentFixture<AppComponent>;
  let debugElement: DebugElement;
  let component: AppComponent;
  let navbarService: NavbarService;
  let authenticationService: AuthenticationService;
  let resourceService: ResourceService;
  let config: AppConfig;
  let router: Router;

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
        GbCohortSelectionModule,
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
          provide: NavbarService,
          useClass: NavbarServiceMock
        },
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    debugElement = fixture.debugElement;
    component = fixture.componentInstance;
    navbarService = TestBed.get(NavbarService);
    authenticationService = TestBed.get(AuthenticationService);
    resourceService = TestBed.get(ResourceService);
    config = TestBed.get(AppConfig);
    router = TestBed.get(Router);
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

  it('should handle configuration error', () => {
    (<AppConfigMock><unknown>config).loaded = false;
    (<AppConfigMock><unknown>config).error = 'Error fetching config';
    component.ngOnInit();
    fixture.detectChanges();
    const messages = debugElement.query(By.css('#statusMessages')).nativeElement.innerText;
    expect(messages).toMatch(/The configuration is not loaded correctly/);
    expect(messages).toMatch(/Error fetching config/);
  });

  it('should handle server up', () => {
    (<AppConfigMock><unknown>config).config['check-server-status'] = true;
    (<ResourceServiceMock><unknown>resourceService).serverStatus = ServerStatus.UP;
    spyOnProperty(authenticationService, 'authorised', 'get')
      .and.callFake(() => {
      return observableOf(true);
    });
    component.ngOnInit();
    fixture.detectChanges();
    expect(debugElement.query(By.directive(GbMainComponent))).not.toBeNull();
  });

  it('should handle server down', () => {
    (<AppConfigMock><unknown>config).config['check-server-status'] = true;
    (<ResourceServiceMock><unknown>resourceService).serverStatus = ServerStatus.DOWN;
    spyOnProperty(authenticationService, 'authorised', 'get')
      .and.callFake(() => {
        return observableOf(true);
      });
    component.ngOnInit();
    fixture.detectChanges();
    expect(debugElement.query(By.css('#statusMessages')).nativeElement.innerText)
      .toBe('The server is down.');
  });

  it('should handle server error', () => {
    (<AppConfigMock><unknown>config).config['check-server-status'] = true;
    (<ResourceServiceMock><unknown>resourceService).serverStatus = ServerStatus.ERROR;
    spyOnProperty(authenticationService, 'authorised', 'get')
      .and.callFake(() => {
      return observableOf(true);
    });
    component.ngOnInit();
    fixture.detectChanges();
    expect(debugElement.query(By.css('#statusMessages')).nativeElement.innerText)
      .toBe('There is an error connecting to the server.');
  });

  it('should handle router events', () => {
    let authenticated = true;
    let authorisedCall = spyOnProperty(authenticationService, 'authorised', 'get')
      .and.callFake(() => {
        return observableOf(authenticated);
      });
    spyOn(router.events, 'subscribe').and.returnValue(event).and.callThrough();
    component.ngOnInit();
    fixture.detectChanges();
    expect(router.events.subscribe).toHaveBeenCalled();
  });
});
