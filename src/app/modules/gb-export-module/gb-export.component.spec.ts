/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbExportComponent} from './gb-export.component';
import {
  AutoCompleteModule, CheckboxModule, DataListModule, DataTableModule, DropdownModule, FieldsetModule, MessagesModule,
  OverlayPanelModule,
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
import {MockComponent} from 'ng2-mock-component';
import {MatExpansionModule} from '@angular/material';

describe('GbExportComponent', () => {
  let component: GbExportComponent;
  let fixture: ComponentFixture<GbExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbExportComponent,
        MockComponent({selector: 'gb-data-table'})
      ],
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
        MessagesModule,
        MatExpansionModule,
        OverlayPanelModule
      ],
      providers: [
        {
          provide: AppConfig,
          useClass: AppConfigMock
        },
        {
          provide: ExportService,
          useClass: ExportServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
