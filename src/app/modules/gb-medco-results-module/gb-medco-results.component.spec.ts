/**
 * Copyright 2018 EPFL LCA1
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbMedcoResultsComponent} from './gb-medco-results.component';
import {
  AutoCompleteModule, CheckboxModule, DataListModule, DataTableModule, DropdownModule, FieldsetModule, MessagesModule,
  PanelModule
} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ResourceService} from '../../services/resource.service';
import {ResourceServiceMock} from '../../services/mocks/resource.service.mock';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock} from '../../config/app.config.mock';
import {ExportService} from '../../services/export.service';
import {ExportServiceMock} from '../../services/mocks/export.service.mock';

// todo: TBD
describe('GbMedcoResultsComponent', () => {
  let component: GbMedcoResultsComponent;
  let fixture: ComponentFixture<GbMedcoResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbMedcoResultsComponent],
      imports: [
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        AutoCompleteModule,
        DataListModule,
        CheckboxModule,
        FieldsetModule,
        DataTableModule,
        PanelModule,
        DropdownModule,
        MessagesModule
      ],
      providers: [
        {
          provide: AppConfig,
          useClass: AppConfigMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbMedcoResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
