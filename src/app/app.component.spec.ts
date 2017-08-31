import {TestBed, async} from '@angular/core/testing';

import {AppComponent} from './app.component';
import {SidePanelModule} from './modules/side-panel/side-panel.module';
import {NavBarModule} from './modules/nav-bar/nav-bar.module';
import {routing} from './app.routing';
import {AppConfig} from './config/app.config';
import {APP_INITIALIZER} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DashboardModule} from './modules/dashboard/dashboard.module';
import {DataSelectionModule} from './modules/data-selection/data-selection.module';
import {AnalysisModule} from './modules/analysis/analysis.module';
import {ExportModule} from './modules/export/export.module';
import {ResourceService} from './modules/shared/services/resource.service';
import {EndpointService} from './modules/shared/services/endpoint.service';
import {DimensionRegistryService} from './modules/shared/services/dimension-registry.service';
import {ConstraintService} from './modules/shared/services/constraint.service';
import {APP_BASE_HREF} from '@angular/common';
import {EndpointServiceMock} from './modules/shared/mocks/endpoint.service.mock';
import {ResourceServiceMock} from './modules/shared/mocks/resource.service.mock';
import {DimensionRegistryServiceMock} from './modules/shared/mocks/dimension-registry.service.mock';
import {ConstraintServiceMock} from './modules/shared/mocks/constraint.service.mock';
import {AppConfigMock} from './config/app.config.mock';

export function initConfig(config: AppConfig) {
  return () => config.load();
}

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        BrowserAnimationsModule,
        NavBarModule,
        SidePanelModule,
        DashboardModule,
        DataSelectionModule,
        AnalysisModule,
        ExportModule,
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
          provide: EndpointService,
          useClass: EndpointServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: DimensionRegistryService,
          useClass: DimensionRegistryServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        }
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
