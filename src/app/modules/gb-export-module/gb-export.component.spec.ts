/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {GbExportComponent} from './gb-export.component';
import {
  AutoCompleteModule,
  CheckboxModule,
  DataViewModule,
  DropdownModule,
  FieldsetModule,
  MessagesModule,
  OverlayPanelModule,
  PanelModule
} from 'primeng';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ExportService} from '../../services/export.service';
import {ExportServiceMock} from '../../services/mocks/export.service.mock';
import {MockComponent} from 'ng2-mock-component';
import {ExportJob} from '../../models/export-models/export-job';
import {GbValidatorsModule} from '../../validators/gb-validators.module';
import {By} from '@angular/platform-browser';
import {ExportFileFormat} from '../../models/export-models/export-file-format';
import {ExportDataType} from '../../models/export-models/export-data-type';
import {GbGenericModule} from '../gb-generic-module/gb-generic.module';
import {TableModule} from 'primeng/table';
import {MatExpansionModule} from '@angular/material/expansion';


const createMockJob = (id: string, name: string) => {
  const job = new ExportJob();
  job.id = id;
  job.name = name;
  job.status = 'Completed';
  job.userId = 'tester';
  return job;
};

const createMockDataType = (name: string, fileFormats: string[]) => {
  const dataType = new ExportDataType(name, true);
  dataType.fileFormats = fileFormats.map(format => new ExportFileFormat(format, true));
  return dataType;
};

const mockJobs = [createMockJob('1', 'Job 1'), createMockJob('2', 'Job 2')];

const mockDataTypes = [createMockDataType('clinical', ['TSV', 'SPSS'])];


describe('GbExportComponent (dataTable)', () => {

  let component: GbExportComponent;
  let fixture: ComponentFixture<GbExportComponent>;
  let exportService: ExportService;

  beforeEach(waitForAsync(() => {
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
        DataViewModule,
        CheckboxModule,
        FieldsetModule,
        TableModule,
        PanelModule,
        DropdownModule,
        MessagesModule,
        MatExpansionModule,
        OverlayPanelModule,
        GbValidatorsModule,
        GbGenericModule
      ],
      providers: [
        {
          provide: ExportService,
          useClass: ExportServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    exportService = TestBed.inject(ExportService);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch the export job names', () => {
    exportService.exportJobs = mockJobs;
    expect(component.jobNames).toEqual(['Job 1', 'Job 2']);
  });

  it('should not have a date column selector', () => {
    expect(component.isTransmartSurveyTable).toBeFalsy();
    expect(component.isExternalExportAvailable).toBeFalsy();
    let dateColumnSelector = fixture.debugElement.query(By.css('.gb-include-date-columns-checkbox'));
    expect(dateColumnSelector).toBeFalsy();
  });

});

describe('GbExportComponent (surveyTable)', () => {

  let component: GbExportComponent;
  let fixture: ComponentFixture<GbExportComponent>;
  let exportService: ExportService;

  beforeEach(waitForAsync(() => {
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
        DataViewModule,
        CheckboxModule,
        FieldsetModule,
        TableModule,
        PanelModule,
        DropdownModule,
        MessagesModule,
        MatExpansionModule,
        OverlayPanelModule,
        GbValidatorsModule,
        GbGenericModule
      ],
      providers: [
        {
          provide: ExportService,
          useClass: ExportServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbExportComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    fixture.detectChanges();
    exportService = TestBed.inject(ExportService);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch the export job names', () => {
    exportService.exportJobs = mockJobs;
    expect(component.jobNames).toEqual(['Job 1', 'Job 2']);
  });

  it('should have a date column selector', () => {
    exportService.exportDataTypes = mockDataTypes;
    let spy = spyOnProperty(component, 'isTransmartSurveyTable', 'get').and.returnValue(true);
    fixture.detectChanges();

    expect(component.isDataTypesUpdating).toBeFalsy();
    expect(component.exportDataTypes.length).toEqual(1);
    let dateColumnSelector = fixture.debugElement.query(By.css('.gb-include-date-columns-checkbox'));
    expect(dateColumnSelector).not.toBeNull();
  });

  it('should have a job name field and a create export job button', () => {
    exportService.exportJobs = mockJobs;
    exportService.exportDataTypes = mockDataTypes;
    fixture.detectChanges();
    const exportJobNameInput = fixture.debugElement.query(By.css('#exportJobNameInput')).nativeElement;
    const createExportJob = fixture.debugElement.query(By.css('#create-export-job')).nativeElement;

    expect(exportJobNameInput).toBeDefined();
    expect(createExportJob).toBeDefined();
  });

});
